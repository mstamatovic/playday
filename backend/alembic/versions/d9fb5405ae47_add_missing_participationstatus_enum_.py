"""add missing participationstatus enum values

Revision ID: (ostavi automatski generisani ID)
Revises: ab879276e0f6
Create Date: 2026-10-30 18:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'auto_generated_id'  # Ostavi onaj koji je Alembic generisao
down_revision: Union[str, Sequence[str], None] = 'ab879276e0f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ✅ Dodajemo sve moguće vrednosti za status prijave.
    # IF NOT EXISTS sprečava grešku ako neka vrednost već postoji u bazi.
    op.execute("ALTER TYPE participationstatus ADD VALUE IF NOT EXISTS 'confirmed'")
    op.execute("ALTER TYPE participationstatus ADD VALUE IF NOT EXISTS 'declined'")


def downgrade() -> None:
    """Downgrade schema."""
    # Brisanje vrednosti iz ENUM-a je komplikovano u Postgres-u i nije potrebno.
    pass