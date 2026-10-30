"""add draft to gamestatus enum

Revision ID: (ostavi onaj koji je generisan)
Revises: (ostavi onaj koji je generisan)
Create Date: 2024-10-30 15:00:00.000000
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'add_draft_enum'  # Možeš ostaviti i automatski generisani ID
down_revision = 'ba5c9d43dd26'
branch_labels = None
depends_on = None

def upgrade():
    # ✅ Dodaj 'draft' u postojeći gamestatus ENUM (IF NOT EXISTS sprečava grešku ako već postoji)
    op.execute("ALTER TYPE gamestatus ADD VALUE IF NOT EXISTS 'draft'")

def downgrade():
    # Brisanje vrednosti iz ENUM-a je komplikovano u Postgres-u, 
    # za sada ostavljamo prazno jer je 'draft' validan i ne smeta.
    pass