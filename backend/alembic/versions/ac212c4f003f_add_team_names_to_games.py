"""add team names and fix participationstatus

Revision ID: ac212c4f003f
Revises: auto_generated_id
Create Date: 2024-10-31 14:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'ac212c4f003f' 
# ✅ Kačimo se na lažni ID koji baza trenutno ima
down_revision: Union[str, Sequence[str], None] = 'auto_generated_id' 
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Dodajemo kolone za imena ekipa
    op.add_column('games', sa.Column('team_a_name', sa.String(), nullable=False, server_default='Ekipa A'))
    op.add_column('games', sa.Column('team_b_name', sa.String(), nullable=False, server_default='Ekipa B'))
    
    # Dodajemo enum vrednosti za svaki slučaj
    op.execute("ALTER TYPE participationstatus ADD VALUE IF NOT EXISTS 'declined'")
    op.execute("ALTER TYPE participationstatus ADD VALUE IF NOT EXISTS 'confirmed'")

def downgrade() -> None:
    op.drop_column('games', 'team_b_name')
    op.drop_column('games', 'team_a_name')