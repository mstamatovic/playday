"""fix broken chain

Revision ID: auto_generated_id
Revises: ab879276e0f6
Create Date: 2024-10-31 13:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# ✅ Ovo je "duh" migracije. Samo služi da poveže lanac.
revision: str = 'auto_generated_id'
down_revision: Union[str, Sequence[str], None] = 'ab879276e0f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    pass # Ne radi ništa, samo popunjava rupu u lancu

def downgrade() -> None:
    pass