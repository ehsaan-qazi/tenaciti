"""Tests for auth service and routes."""

import pytest
from datetime import datetime, timezone, timedelta


class TestAuthService:
    """Tests for auth_service.py functions."""

    def test_hash_password(self):
        """Test password hashing with Argon2id."""
        from app.services.auth_service import hash_password, verify_password

        password = "TestPass123"
        hashed = hash_password(password)

        assert hashed is not None
        assert isinstance(hashed, str)
        assert len(hashed) > 50  # Argon2id hash is long
        assert verify_password(hashed, password) is True

    def test_verify_password_correct(self):
        """Test verifying correct password."""
        from app.services.auth_service import hash_password, verify_password

        password = "TestPass123"
        hashed = hash_password(password)

        assert verify_password(hashed, password) is True

    def test_verify_password_incorrect(self):
        """Test verifying incorrect password."""
        from app.services.auth_service import hash_password, verify_password

        password = "TestPass123"
        wrong_password = "WrongPass123"
        hashed = hash_password(password)

        assert verify_password(hashed, wrong_password) is False

    def test_validate_password_valid(self):
        """Test password validation with valid passwords."""
        from app.services.auth_service import validate_password

        # Valid passwords
        valid_passwords = [
            "TestPass123",
            "abc12345",
            "Password1",
            "a1" * 32,  # 64 chars
        ]

        for pwd in valid_passwords:
            validate_password(pwd)  # Should not raise

    def test_validate_password_invalid(self):
        """Test password validation rejects invalid passwords."""
        from app.services.auth_service import validate_password, PasswordPolicyError

        invalid_passwords = [
            "short",           # too short
            "NoNumbers",       # no numbers
            "12345678",        # no letters
            "a" * 65,          # too long
            "",                # empty
            "NoNumbersOrSpecial",  # no numbers
        ]

        for pwd in invalid_passwords:
            with pytest.raises(PasswordPolicyError):
                validate_password(pwd)

    def test_normalize_email(self):
        """Test email normalization."""
        from app.services.auth_service import normalize_email

        assert normalize_email("Test@Example.COM") == "test@example.com"
        assert normalize_email("  USER@DOMAIN.COM  ") == "user@domain.com"
        assert normalize_email("user@domain.com") == "user@domain.com"

    def test_is_account_locked(self):
        """Test account lockout check."""
        from app.services.auth_service import is_account_locked
        from datetime import datetime, timezone, timedelta

        # Not locked
        assert is_account_locked(None) is False
        assert is_account_locked(datetime.now(timezone.utc) - timedelta(minutes=1)) is False

        # Locked
        assert is_account_locked(datetime.now(timezone.utc) + timedelta(minutes=1)) is True

    def test_lock_account(self):
        """Test account lockout after max attempts."""
        from app.services.auth_service import lock_account

        # Below threshold
        count, locked = lock_account(0)
        assert count == 1
        assert locked is None

        count, locked = lock_account(3)
        assert count == 4
        assert locked is None

        # At threshold
        count, locked = lock_account(4)
        assert count == 5
        assert locked is not None
        assert locked > datetime.now(timezone.utc)

    def test_unlock_account(self):
        """Test account unlock."""
        from app.services.auth_service import unlock_account

        count, locked = unlock_account()
        assert count == 0
        assert locked is None

    def test_generate_reset_token(self):
        """Test reset token generation."""
        from app.services.auth_service import generate_reset_token, hash_reset_token

        raw_token, token_hash = generate_reset_token()

        assert raw_token is not None
        assert token_hash is not None
        assert len(raw_token) > 20  # base64url encoded 32 bytes
        assert len(token_hash) == 64  # SHA256 hex

        # Verify hash matches
        assert hash_reset_token(raw_token) == token_hash

    def test_create_local_access_token(self):
        """Test JWT creation."""
        from app.services.auth_service import create_local_access_token, decode_local_access_token

        token = create_local_access_token(user_id=1, token_version=1, email="test@example.com")
        assert token is not None

        payload = decode_local_access_token(token)
        assert payload["sub"] == "1"
        assert payload["email"] == "test@example.com"
        assert payload["token_version"] == 1
        assert payload["type"] == "local"


class TestAuthRoutes:
    """Tests for auth routes (register, login, forgot-password, reset-password)."""

    @pytest.mark.asyncio
    async def test_register_success(self, async_client):
        """Test successful user registration."""
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "newuser@example.com",
            "password": "NewPass123",
            "full_name": "New User"
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "newuser@example.com"
        assert data["user"]["full_name"] == "New User"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, async_client):
        """Test registration with duplicate email fails."""
        # First registration
        await async_client.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "password": "Pass1234",
            "full_name": "First"
        })

        # Second registration with same email
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "password": "Pass1234",
            "full_name": "Second"
        })

        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_register_invalid_password(self, async_client):
        """Test registration with invalid password."""
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "weak",  # Too short
            "full_name": "Test"
        })

        # Pydantic validation returns 422 for schema violations
        assert response.status_code in (400, 422)
        detail = response.json()["detail"]
        # Check for either custom validation message or Pydantic's default
        detail_str = str(detail).lower()
        assert ("password must be" in detail_str or
                "at least 8 characters" in detail_str or
                "string_too_short" in detail_str)

    @pytest.mark.asyncio
    async def test_login_success(self, async_client):
        """Test successful login."""
        # Register first
        await async_client.post("/api/v1/auth/register", json={
            "email": "login_test@example.com",
            "password": "LoginPass123",
            "full_name": "Login Test"
        })

        # Login
        response = await async_client.post("/api/v1/auth/login", json={
            "email": "login_test@example.com",
            "password": "LoginPass123"
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "login_test@example.com"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client):
        """Test login with wrong password."""
        await async_client.post("/api/v1/auth/register", json={
            "email": "wrongpass@example.com",
            "password": "CorrectPass123",
            "full_name": "Wrong Pass"
        })

        response = await async_client.post("/api/v1/auth/login", json={
            "email": "wrongpass@example.com",
            "password": "WrongPass123"
        })

        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client):
        """Test login with nonexistent user (should not reveal user exists)."""
        response = await async_client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "AnyPass123"
        })

        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_account_lockout(self, async_client):
        """Test account lockout after failed attempts."""
        email = "lockout_test@example.com"
        await async_client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "CorrectPass123",
            "full_name": "Lockout Test"
        })

        # 5 failed attempts
        for i in range(5):
            response = await async_client.post("/api/v1/auth/login", json={
                "email": email,
                "password": "WrongPass"
            })
            if i < 4:
                assert response.status_code == 401
            else:
                assert response.status_code == 403
                assert "locked" in response.json()["detail"].lower()

        # 6th attempt should also be locked
        response = await async_client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "WrongPass"
        })
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_forgot_password(self, async_client):
        """Test forgot password request."""
        await async_client.post("/api/v1/auth/register", json={
            "email": "forgot@example.com",
            "password": "ForgotPass123",
            "full_name": "Forgot Test"
        })

        response = await async_client.post("/api/v1/auth/forgot-password", json={
            "email": "forgot@example.com"
        })

        assert response.status_code == 200
        assert "reset link has been sent" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_forgot_password_nonexistent(self, async_client):
        """Test forgot password for nonexistent user (should not reveal)."""
        response = await async_client.post("/api/v1/auth/forgot-password", json={
            "email": "nonexistent@example.com"
        })

        assert response.status_code == 200
        assert "reset link has been sent" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_reset_password_success(self, async_client, db_session):
        """Test successful password reset."""
        from app.models.user import User, PasswordResetToken
        from app.services.auth_service import hash_reset_token
        from sqlalchemy import select

        # Register user
        await async_client.post("/api/v1/auth/register", json={
            "email": "reset_test@example.com",
            "password": "OldPass123",
            "full_name": "Reset Test"
        })

        # Get user and create reset token
        result = await db_session.execute(select(User).where(User.email == "reset_test@example.com"))
        user = result.scalar_one()

        raw_token = "test-reset-token-1234567890abcdef"
        token_hash = hash_reset_token(raw_token)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db_session.add(reset_token)
        await db_session.commit()

        # Reset password
        response = await async_client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "password": "NewPass123"
        })

        assert response.status_code == 200
        assert "reset successfully" in response.json()["message"]

        # Verify can login with new password
        login_response = await async_client.post("/api/v1/auth/login", json={
            "email": "reset_test@example.com",
            "password": "NewPass123"
        })
        assert login_response.status_code == 200

    @pytest.mark.asyncio
    async def test_reset_password_invalid_token(self, async_client):
        """Test reset password with invalid token."""
        response = await async_client.post("/api/v1/auth/reset-password", json={
            "token": "invalid-token",
            "password": "NewPass123"
        })

        assert response.status_code == 400
        assert "Invalid or expired" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_reset_password_expired_token(self, async_client, db_session):
        """Test reset password with expired token."""
        from app.models.user import User, PasswordResetToken
        from app.services.auth_service import hash_reset_token
        from sqlalchemy import select

        await async_client.post("/api/v1/auth/register", json={
            "email": "expired@example.com",
            "password": "OldPass123",
            "full_name": "Expired Test"
        })

        result = await db_session.execute(select(User).where(User.email == "expired@example.com"))
        user = result.scalar_one()

        raw_token = "expired-token-1234567890abcdef"
        token_hash = hash_reset_token(raw_token)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1),  # Expired
        )
        db_session.add(reset_token)
        await db_session.commit()

        response = await async_client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "password": "NewPass123"
        })

        assert response.status_code == 400
        assert "Invalid or expired" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_reset_password_used_token(self, async_client, db_session):
        """Test reset password with already used token."""
        from app.models.user import User, PasswordResetToken
        from app.services.auth_service import hash_reset_token
        from sqlalchemy import select

        await async_client.post("/api/v1/auth/register", json={
            "email": "used@example.com",
            "password": "OldPass123",
            "full_name": "Used Test"
        })

        result = await db_session.execute(select(User).where(User.email == "used@example.com"))
        user = result.scalar_one()

        raw_token = "used-token-1234567890abcdef"
        token_hash = hash_reset_token(raw_token)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used_at=datetime.now(timezone.utc),  # Already used
        )
        db_session.add(reset_token)
        await db_session.commit()

        response = await async_client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "password": "NewPass123"
        })

        assert response.status_code == 400
        assert "Invalid or expired" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_reset_password_invalid_new_password(self, async_client, db_session):
        """Test reset password with invalid new password."""
        from app.models.user import User, PasswordResetToken
        from app.services.auth_service import hash_reset_token
        from sqlalchemy import select

        await async_client.post("/api/v1/auth/register", json={
            "email": "invalid_new@example.com",
            "password": "OldPass123",
            "full_name": "Invalid New Test"
        })

        result = await db_session.execute(select(User).where(User.email == "invalid_new@example.com"))
        user = result.scalar_one()

        raw_token = "invalid-new-token-1234567890abcd"
        token_hash = hash_reset_token(raw_token)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db_session.add(reset_token)
        await db_session.commit()

        # Try to reset with weak password
        response = await async_client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "password": "weak"
        })

        assert response.status_code in (400, 422)
        detail_str = str(response.json()["detail"]).lower()
        assert ("password must be" in detail_str or
                "at least 8 characters" in detail_str or
                "string_too_short" in detail_str)