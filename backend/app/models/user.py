"""User model — authentication and tier management."""

from datetime import datetime
from sqlalchemy import (
    String, Boolean, DateTime, Index, Integer, func, ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    # Supabase Auth UID — links our user to the Supabase auth.users record
    # Nullable for users who only register locally (email/password)
    supabase_uid: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    institution: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(500))

    # Local authentication fields (for email/password users)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Email verification (Google OAuth users are auto-verified)
    is_email_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    # Login tracking for brute-force protection
    failed_login_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Token version for manual logout/revocation
    token_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Tier management
    plan: Mapped[str] = mapped_column(
        String(20), nullable=False, default="free",
        server_default="free",
    )
    plan_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    gpa_entries = relationship("GpaEntry", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_supabase_uid", "supabase_uid"),
    )

    def __repr__(self) -> str:
        return f"<User {self.id} {self.email} plan={self.plan}>"


class PasswordResetToken(Base):
    """Minimal table for forgot password tracking."""
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # SHA256 hash of the 32-byte random token
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_password_reset_tokens_token_hash", "token_hash"),
        Index("idx_password_reset_tokens_expires_at", "expires_at"),
    )

    def __repr__(self) -> str:
        return f"<PasswordResetToken {self.id} user_id={self.user_id}>"


class EmailVerificationToken(Base):
    """Single-use token for verifying a user's email address."""
    __tablename__ = "email_verification_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # SHA256 hash of the 32-byte random token — raw token is sent via email
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_email_verification_tokens_token_hash", "token_hash"),
        Index("idx_email_verification_tokens_expires_at", "expires_at"),
    )

    def __repr__(self) -> str:
        return f"<EmailVerificationToken {self.id} user_id={self.user_id}>"
