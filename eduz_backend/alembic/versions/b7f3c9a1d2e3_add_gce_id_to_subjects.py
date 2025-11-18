"""add gce_id to subjects

Revision ID: b7f3c9a1d2e3
Revises: d304f7bdcdaa
Create Date: 2025-09-28 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b7f3c9a1d2e3'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('subjects', sa.Column('gce_id', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('subjects', 'gce_id')
