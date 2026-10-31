"""add team names to games

Revision ID: ac212c4f003f
Revises: d9fb5405ae47
Create Date: 2024-10-31 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# ✅ KLJUČNO: Ovo moraju biti tačni hash-ovi da bi lanac migracija radio
revision: str = 'ac212c4f003f' 
down_revision: Union[str, Sequence[str], None] = 'd9fb5405ae47' 
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Dodajemo kolone sa server_default da postojeći redovi u bazi ne pucaju
    op.add_column('games', sa.Column('team_a_name', sa.String(), nullable=False, server_default='Ekipa A'))
    op.add_column('games', sa.Column('team_b_name', sa.String(), nullable=False, server_default='Ekipa B'))

def downgrade() -> None:
    op.drop_column('games', 'team_b_name')
    op.drop_column('games', 'team_a_name')