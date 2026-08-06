"""
Authentication service — password hashing, JWT issuance, password policy, and token generation.
"""

import re
import secrets
import hashlib
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError

from app.config import settings


# Argon2id hasher with recommended parameters
ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

# JWT settings
LOCAL_JWT_SECRET = settings.app_secret_key
LOCAL_JWT_ALGORITHM = "HS256"
LOCAL_JWT_EXPIRE_DAYS = 7  # 7-day access token (no refresh token for simplicity)

# Password policy regex
# Min 8 chars, max 64 chars, at least 1 letter, 1 number
PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,64}$")

# Lockout settings
MAX_FAILED_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

# Password reset token settings
RESET_TOKEN_BYTES = 32
RESET_TOKEN_EXPIRE_HOURS = 1

# Email verification token settings
VERIFICATION_TOKEN_BYTES = 32
VERIFICATION_TOKEN_EXPIRE_HOURS = 24


class PasswordPolicyError(ValueError):
    """Raised when password doesn't meet policy requirements."""
    pass


class AccountLockedError(ValueError):
    """Raised when account is temporarily locked due to failed attempts."""
    pass


class InvalidCredentialsError(ValueError):
    """Raised when email/password combination is invalid."""
    pass


class PasswordResetTokenError(ValueError):
    """Raised when password reset token is invalid, expired, or used."""
    pass


def normalize_email(email: str) -> str:
    """Normalize email to lowercase for consistent lookups."""
    return email.strip().lower()


def validate_password(password: str) -> None:
    """Validate password against policy. Raises PasswordPolicyError if invalid."""
    if not PASSWORD_PATTERN.match(password):
        raise PasswordPolicyError(
            "Password must be 8-64 characters and contain at least one letter and one number."
        )


def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return ph.hash(password)


def verify_password(hashed_password: str, password: str) -> bool:
    """Verify password against Argon2id hash. Returns True if valid."""
    try:
        ph.verify(hashed_password, password)
        return True
    except (VerifyMismatchError, VerificationError):
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Check if password hash needs rehashing (e.g., parameters changed)."""
    try:
        return ph.check_needs_rehash(hashed_password)
    except VerificationError:
        return True


def create_local_access_token(user_id: int, token_version: int, email: str) -> str:
    """
    Create a local JWT access token for email/password users.
    Includes token_version for revocation capability.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=LOCAL_JWT_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "email": email,
        "token_version": token_version,
        "type": "local",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, LOCAL_JWT_SECRET, algorithm=LOCAL_JWT_ALGORITHM)


def decode_local_access_token(token: str) -> dict:
    """Decode and validate local JWT access token. Raises JWTError if invalid."""
    return jwt.decode(token, LOCAL_JWT_SECRET, algorithms=[LOCAL_JWT_ALGORITHM])


def generate_reset_token() -> tuple[str, str]:
    """
    Generate a secure password reset token.
    Returns (raw_token, token_hash) where:
    - raw_token: base64url-encoded 32-byte token to send via email
    - token_hash: SHA256 hash of raw_token to store in database
    """
    raw_token = secrets.token_urlsafe(RESET_TOKEN_BYTES)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    return raw_token, token_hash


def hash_reset_token(raw_token: str) -> str:
    """Hash a raw reset token for database storage."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


def create_reset_token_expiry() -> datetime:
    """Create expiry datetime for password reset token."""
    return datetime.now(timezone.utc) + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)


def create_verification_token_expiry() -> datetime:
    """Create expiry datetime for email verification token (24 hours)."""
    return datetime.now(timezone.utc) + timedelta(hours=VERIFICATION_TOKEN_EXPIRE_HOURS)


def is_account_locked(locked_until: datetime | None) -> bool:
    """Check if account is currently locked."""
    if locked_until is None:
        return False
    # Handle naive datetimes from SQLite by assuming UTC
    if locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) < locked_until


def lock_account(failed_count: int) -> tuple[int, datetime | None]:
    """
    Increment failed login count and lock if threshold exceeded.
    Returns (new_failed_count, locked_until).
    """
    new_count = failed_count + 1
    if new_count >= MAX_FAILED_LOGIN_ATTEMPTS:
        locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        return new_count, locked_until
    return new_count, None


def unlock_account() -> tuple[int, None]:
    """Reset failed login count and unlock account."""
    return 0, None


def generate_password_reset_email_body(
    reset_link: str,
    expiry_hours: int = RESET_TOKEN_EXPIRE_HOURS
) -> str:
    """Generate HTML email body for password reset."""
    return f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Reset Your Password</h2>
            <p>You requested a password reset for your Tenaciti account.</p>
            <p>Click the button below to set a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #1a1a2e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </p>
            <p>Or copy this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{reset_link}</p>
            <p>This link expires in <strong>{expiry_hours} hour{'s' if expiry_hours != 1 else ''}</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">Tenaciti Study App</p>
        </div>
    </body>
    </html>
    """