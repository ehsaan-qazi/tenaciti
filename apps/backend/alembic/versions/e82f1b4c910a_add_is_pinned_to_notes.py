"""add is_pinned to notes

Revision ID: e82f1b4c910a
Revises: c9e1a4f72b38
Create Date: 2026-08-13 14:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e82f1b4c910a'
down_revision: Union[str, Sequence[str], None] = ('c9e1a4f72b38', '0315f0f2ef4f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'notes',
        sa.Column(
            'is_pinned',
            sa.Boolean(),
            nullable=False,
            server_default='false',
        ),
    )


def downgrade() -> None:
    op.drop_column('notes', 'is_pinned')
