"""add email verification

Revision ID: c9e1a4f72b38
Revises: b7d3f91e2c50
Create Date: 2026-07-25 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c9e1a4f72b38'
down_revision: Union[str, None] = 'b7d3f91e2c50'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_email_verified to users (existing users get False; Google users
    # will be set to True at next login via the middleware).
    op.add_column(
        'users',
        sa.Column(
            'is_email_verified',
            sa.Boolean(),
            nullable=False,
            server_default='false',
        ),
    )

    # Create email_verification_tokens table
    op.create_table(
        'email_verification_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            name='fk_email_verification_tokens_user_id',
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash'),
    )
    op.create_index(
        'idx_email_verification_tokens_token_hash',
        'email_verification_tokens',
        ['token_hash'],
        unique=False,
    )
    op.create_index(
        'idx_email_verification_tokens_expires_at',
        'email_verification_tokens',
        ['expires_at'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index('idx_email_verification_tokens_expires_at', table_name='email_verification_tokens')
    op.drop_index('idx_email_verification_tokens_token_hash', table_name='email_verification_tokens')
    op.drop_table('email_verification_tokens')
    op.drop_column('users', 'is_email_verified')
