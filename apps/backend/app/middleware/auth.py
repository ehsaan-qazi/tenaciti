"""
Auth middleware — validates JWT (local or Supabase) and resolves to our app User.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
import httpx
import jwt as pyjwt
from jwt import PyJWKClient

from app.config import settings
from app.database import get_db
from app.models.user import User

# Supabase uses ES256 JWTs signed with a keyed JWKS
SUPABASE_ALGORITHM = "ES256"

# Create PyJWKClient once at startup for Supabase JWT verification
if settings.supabase_url:
    JWKS_URL = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    jwks_client = PyJWKClient(JWKS_URL)
else:
    jwks_client = None

# Local JWT settings
LOCAL_JWT_ALGORITHM = "HS256"
LOCAL_JWT_SECRET = settings.app_secret_key

# FastAPI security scheme — extracts Bearer token from Authorization header
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency that implements hybrid authentication:
    1. First tries to decode as a LOCAL JWT (email/password users)
       - Validates token signature using LOCAL_JWT_SECRET
       - Verifies token_version matches database (allows revocation)
    2. If that fails, tries to decode as a SUPABASE JWT (Google OAuth users)
       - Validates using Supabase JWT secret
       - Falls back to Supabase API verification if no secret
    3. Returns the User ORM object
    """
    token = credentials.credentials

    # ─── STRATEGY 1: Local JWT (email/password users) ───
    try:
        local_payload = jwt.decode(
            token,
            LOCAL_JWT_SECRET,
            algorithms=[LOCAL_JWT_ALGORITHM],
        )
        # Verify this is a local token (type claim)
        if local_payload.get("type") == "local":
            user_id = local_payload.get("sub")
            token_version = local_payload.get("token_version")
            email = local_payload.get("email")

            if user_id and token_version is not None and email:
                # Look up user by ID (local users don't have supabase_uid)
                result = await db.execute(
                    select(User).where(User.id == int(user_id))
                )
                user = result.scalar_one_or_none()

                if user and user.token_version == token_version:
                    # Valid local token with matching version
                    return user
                elif user:
                    # Token version mismatch - token was revoked
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token has been revoked",
                    )
    except JWTError:
        # Not a valid local token, fall through to Supabase verification
        pass
    except ValueError:
        # Invalid user_id format
        pass

    # ─── STRATEGY 2: Supabase JWT (Google OAuth users) ───
    supabase_uid: str | None = None
    email: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None

    # Strategy 2a: Local Supabase JWT verification via JWKS (ES256)
    if jwks_client:
        try:
            # DEBUG LOG
            unverified_header = pyjwt.get_unverified_header(token)
            print(f"DEBUG - Incoming Supabase JWT Header: {unverified_header}")

            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = pyjwt.decode(
                token,
                signing_key.key,
                algorithms=[SUPABASE_ALGORITHM],
                audience="authenticated",
                issuer=f"{settings.supabase_url}/auth/v1",
            )
            supabase_uid = payload.get("sub")
            email = payload.get("email")
            # User metadata may contain name/avatar from Google OAuth
            user_metadata = payload.get("user_metadata", {})
            full_name = user_metadata.get("full_name") or user_metadata.get("name")
            avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")
        except pyjwt.PyJWTError as e:
            print(f"Supabase JWT Verification Failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
    else:
        # Strategy 2b: Verify via Supabase API (slower fallback)
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.supabase_anon_key,
                },
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token",
                )
            data = resp.json()
            supabase_uid = data.get("id")
            email = data.get("email")
            user_metadata = data.get("user_metadata", {})
            full_name = user_metadata.get("full_name") or user_metadata.get("name")
            avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")

    if not supabase_uid or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not identify user from token",
        )

    # Look up user in our database by Supabase UID
    result = await db.execute(
        select(User).where(User.supabase_uid == supabase_uid)
    )
    user = result.scalar_one_or_none()

    # Auto-create user on first login (sync from Supabase auth)
    if user is None:
        user = User(
            supabase_uid=supabase_uid,
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
            plan="free",
            # Google OAuth users have their email verified by Supabase
            is_email_verified=True,
        )
        db.add(user)
        await db.flush()  # get the ID assigned
        await db.refresh(user)

    # Update profile fields if they changed (e.g., user updated Google profile)
    else:
        changed = False
        if full_name and user.full_name != full_name:
            user.full_name = full_name
            changed = True
        if avatar_url and user.avatar_url != avatar_url:
            user.avatar_url = avatar_url
            changed = True
        if email and user.email != email:
            user.email = email
            changed = True
        # Ensure existing Google users are marked verified
        if not user.is_email_verified:
            user.is_email_verified = True
            changed = True
        if changed:
            await db.flush()
            await db.refresh(user)

    return user


async def get_verified_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Extends get_current_user by additionally requiring the user's email
    to be verified. This is the enforced backend security gate — the
    frontend check is only UX. Even if a user manipulates localStorage
    or React state, their API calls will be rejected here with 403.
    """
    if not current_user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address not verified. Please check your inbox.",
        )
    return current_user