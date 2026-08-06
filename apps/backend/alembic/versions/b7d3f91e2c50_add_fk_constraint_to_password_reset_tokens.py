"""add foreign key constraint to password_reset_tokens

Revision ID: b7d3f91e2c50
Revises: 459c5082f242
Create Date: 2026-07-25 12:39:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b7d3f91e2c50'
down_revision: Union[str, None] = '459c5082f242'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the missing FK constraint that was not generated in the original migration.
    # This ensures the DB enforces referential integrity and cascades deletes.
    op.create_foreign_key(
        'fk_password_reset_tokens_user_id',
        'password_reset_tokens',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    op.drop_constraint(
        'fk_password_reset_tokens_user_id',
        'password_reset_tokens',
        type_='foreignkey',
    )
