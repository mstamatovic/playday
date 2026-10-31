"""add team names and fix participationstatus

Revision ID: ac212c4f003f
Revises: ab879276e0f6
Create Date: 2024-10-31 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# ✅ KLJUČNO: Kačimo se na 'ab879276e0f6' jer je to poslednja sigurna tačka
revision: str = 'ac212c4f003f' 
down_revision: Union[str, Sequence[str], None] = 'ab879276e0f6' 
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Dodajemo kolone za imena ekipa (sa default vrednostima)
    op.add_column('games', sa.Column('team_a_name', sa.String(), nullable=False, server_default='Ekipa A'))
    op.add_column('games', sa.Column('team_b_name', sa.String(), nullable=False, server_default='Ekipa B'))
    
    # 2. Dodajemo 'declined' i 'confirmed' u participationstatus (za svaki slučaj, ako prethodna migracija nije prošla)
    # IF NOT EXISTS sprečava grešku ako već postoje
    op.execute("ALTER TYPE participationstatus ADD VALUE IF NOT EXISTS 'declined'")
    op.execute("ALTER TYPE participationstatus ADD VALUE IF NOT EXISTS 'confirmed'")

def downgrade() -> None:
    op.drop_column('games', 'team_b_name')
    op.drop_column('games', 'team_a_name')