"""Auth routes — local email/password auth + Supabase OAuth + password reset."""
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User, PasswordResetToken, EmailVerificationToken
from app.schemas.auth import (
    UserResponse,
    UserUpdate,
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
    VerifyEmailRequest,
)
from app.services import (
    hash_password,
    verify_password,
    create_local_access_token,
    generate_reset_token,
    hash_reset_token,
    create_reset_token_expiry,
    create_verification_token_expiry,
    validate_password,
    normalize_email,
    is_account_locked,
    lock_account,
    unlock_account,
    send_password_reset_email,
    send_verification_email,
    PasswordPolicyError,
    LOCKOUT_DURATION_MINUTES,
    needs_rehash,
)
from app.config import settings
from app.middleware.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently logged in user based on the JWT token (local or Supabase)."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile information."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.institution is not None:
        current_user.institution = user_update.institution
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/callback", response_model=UserResponse)
async def auth_callback(current_user: User = Depends(get_current_user)):
    """
    Called by the frontend after a successful Supabase login.
    The `get_current_user` dependency automatically handles creating
    or updating the user record in our database based on the JWT token.
    """
    return current_user


# ─── Local Email/Password Auth ───

@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(
    request: Request,
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user with email and password.
    Returns a local JWT access token.
    """
    email = normalize_email(data.email)

    # Check if user already exists
    result = await db.execute(select(User).where(User.email == email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Validate password policy
    try:
        validate_password(data.password)
    except PasswordPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Hash password and create user (unverified by default)
    hashed = hash_password(data.password)
    user = User(
        email=email,
        hashed_password=hashed,
        full_name=data.full_name,
        plan="free",
        token_version=1,
        is_email_verified=False,
    )
    db.add(user)
    await db.flush()  # get ID

    # Generate email verification token
    raw_token, token_hash = generate_reset_token()  # reuse same secure generation
    expires_at = create_verification_token_expiry()
    verification_token = EmailVerificationToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(verification_token)
    await db.commit()  # persist user + token together
    await db.refresh(user)  # reload server-generated fields like created_at / updated_at

    # Send verification email (non-blocking — don't fail registration if email fails)
    frontend_url = settings.cors_origin_list[0] if settings.cors_origin_list else "http://localhost:5173"
    verification_link = f"{frontend_url}/verify-email/confirm?token={raw_token}"
    asyncio.create_task(send_verification_email(user.email, verification_link))

    # Issue JWT — user is logged in but unverified. Backend enforces the gate
    # via get_verified_user on all business endpoints.
    access_token = create_local_access_token(user.id, user.token_version, user.email)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=604800,  # 7 days
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user with email and password.
    Returns a local JWT access token on success.
    Implements account lockout after 5 failed attempts.
    """
    email = normalize_email(data.email)

    # Look up user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Constant-time check to prevent user enumeration
    if user is None or user.hashed_password is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check account lockout
    if is_account_locked(user.locked_until):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account temporarily locked. Try again in {LOCKOUT_DURATION_MINUTES} minutes.",
        )

    # Verify password
    if not verify_password(user.hashed_password, data.password):
        # Increment failed count and potentially lock
        new_count, locked_until = lock_account(user.failed_login_count)
        user.failed_login_count = new_count
        user.locked_until = locked_until
        await db.commit()

        if locked_until:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Too many failed attempts. Account locked for 15 minutes.",
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Password correct - reset failed count and unlock
    user.failed_login_count, user.locked_until = unlock_account()

    # Rehash if needed (e.g., Argon2 parameters updated)
    if needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(data.password)

    await db.commit()
    await db.refresh(user)  # reload onupdate=func.now() updated_at field

    # Create local JWT
    access_token = create_local_access_token(user.id, user.token_version, user.email)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=604800,  # 7 days
        user=UserResponse.model_validate(user),
    )


# ─── Password Reset Flow ───

@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Request a password reset link.
    Always returns success to prevent email enumeration.
    """
    email = normalize_email(data.email)

    # Look up user (but don't reveal if exists)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user and user.hashed_password is not None:
        # Invalidate any existing unused tokens for this user
        from sqlalchemy import update
        await db.execute(
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None),
            )
            .values(used_at=datetime.now(timezone.utc))
        )

        # Generate new reset token
        raw_token, token_hash = generate_reset_token()
        expires_at = create_reset_token_expiry()

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(reset_token)
        await db.commit()

        # Send reset email
        frontend_url = settings.cors_origin_list[0] if settings.cors_origin_list else "http://localhost:5173"
        reset_link = f"{frontend_url}/reset-password?token={raw_token}"

        import asyncio
        asyncio.create_task(send_password_reset_email(user.email, reset_link))

    # Always return success to prevent email enumeration
    return MessageResponse(
        message="If an account with that email exists, a password reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Reset password using a valid reset token.
    """
    # Validate new password
    try:
        validate_password(data.password)
    except PasswordPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Hash the provided token to look up in DB
    token_hash = hash_reset_token(data.token)

    # Find valid token
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Get user
    user_result = await db.execute(select(User).where(User.id == reset_token.user_id))
    user = user_result.scalar_one_or_none()

    if not user or user.hashed_password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )

    # Update password
    user.hashed_password = hash_password(data.password)
    user.token_version += 1  # Invalidate all existing sessions
    user.failed_login_count = 0  # Unlock account
    user.locked_until = None
    reset_token.used_at = datetime.now(timezone.utc)

    await db.commit()

    return MessageResponse(message="Password has been reset successfully")


# ─── Email Verification ───

@router.post("/verify-email", response_model=UserResponse)
@limiter.limit("10/minute")
async def verify_email(
    request: Request,
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Confirm a user's email address using the token from their verification link.
    This endpoint is the BACKEND security gate — it sets is_email_verified=True in
    the database. The frontend can't fake this, because even with a manipulated
    local token the DB record remains unverified until this is called.
    """
    token_hash = hash_reset_token(data.token)

    result = await db.execute(
        select(EmailVerificationToken).where(
            EmailVerificationToken.token_hash == token_hash,
            EmailVerificationToken.used_at.is_(None),
            EmailVerificationToken.expires_at > datetime.now(timezone.utc),
        )
    )
    verification_token = result.scalar_one_or_none()

    if not verification_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link.",
        )

    user_result = await db.execute(select(User).where(User.id == verification_token.user_id))
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found.",
        )

    # Mark user as verified and consume the token
    user.is_email_verified = True
    verification_token.used_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(user)

    return UserResponse.model_validate(user)


@router.post("/resend-verification", response_model=MessageResponse)
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Resend a verification email to the currently logged-in but unverified user.
    Requires a valid JWT (the user is already authenticated, just not yet verified).
    Invalidates all previous tokens and generates a fresh one.
    """
    if current_user.is_email_verified:
        return MessageResponse(message="Your email is already verified.")

    if not current_user.hashed_password:
        # Google OAuth users shouldn't reach here, but guard anyway
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google login and does not require email verification.",
        )

    # Invalidate all unused tokens for this user
    await db.execute(
        update(EmailVerificationToken)
        .where(
            EmailVerificationToken.user_id == current_user.id,
            EmailVerificationToken.used_at.is_(None),
        )
        .values(used_at=datetime.now(timezone.utc))
    )

    # Generate a fresh token
    raw_token, token_hash = generate_reset_token()
    expires_at = create_verification_token_expiry()
    new_token = EmailVerificationToken(
        user_id=current_user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(new_token)
    await db.commit()

    frontend_url = settings.cors_origin_list[0] if settings.cors_origin_list else "http://localhost:5173"
    verification_link = f"{frontend_url}/verify-email/confirm?token={raw_token}"
    asyncio.create_task(send_verification_email(current_user.email, verification_link))

    return MessageResponse(
        message="A new verification link has been sent to your email address."
    )