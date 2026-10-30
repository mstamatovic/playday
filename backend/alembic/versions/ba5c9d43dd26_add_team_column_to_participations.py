"""Add team column to participations

Revision ID: ba5c9d43dd26
Revises: 3e7051d467d8
Create Date: 2024-10-30 14:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ba5c9d43dd26'
down_revision = '3e7051d467d8'
branch_labels = None
depends_on = None

def upgrade():
    # ✅ 1. Prvo kreiraj ENUM tip 'team' u bazi (checkfirst=True sprečava grešku ako već postoji)
    team_enum = sa.Enum('A', 'B', name='team')
    team_enum.create(op.get_bind(), checkfirst=True)
    
    # ✅ 2. Zatim dodaj kolonu koristeći taj kreirani ENUM tip
    op.add_column('participations', sa.Column('team', team_enum, nullable=True))

def downgrade():
    # ✅ 1. Prvo obriši kolonu
    op.drop_column('participations', 'team')
    
    # ✅ 2. Zatim obriši i sam ENUM tip iz baze
    team_enum = sa.Enum('A', 'B', name='team')
    team_enum.drop(op.get_bind(), checkfirst=True)