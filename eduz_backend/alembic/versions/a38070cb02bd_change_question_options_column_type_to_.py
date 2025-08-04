"""Change Question.options column type to JSON

Revision ID: a38070cb02bd
Revises: 
Create Date: 2025-08-04 13:23:55.382651

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a38070cb02bd'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('questions', sa.Column('systems', sa.String(), nullable=True))

def downgrade():
    op.drop_column('questions', 'systems')
