"""add all missing gamestatus enum values

Revision ID: ab879276e0f6
Revises: add_draft_enum
Create Date: 2026-10-30 17:59:04.324215

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab879276e0f6'
down_revision: Union[str, Sequence[str], None] = 'add_draft_enum'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ✅ Dodajemo sve moguće vrednosti za status termina. 
    # IF NOT EXISTS sprečava grešku ako neka vrednost već postoji u bazi.
    op.execute("ALTER TYPE gamestatus ADD VALUE IF NOT EXISTS 'draft'")
    op.execute("ALTER TYPE gamestatus ADD VALUE IF NOT EXISTS 'confirmed'")
    op.execute("ALTER TYPE gamestatus ADD VALUE IF NOT EXISTS 'cancelled'")
    op.execute("ALTER TYPE gamestatus ADD VALUE IF NOT EXISTS 'locked'")


def downgrade() -> None:
    """Downgrade schema."""
    # Brisanje vrednosti iz ENUM-a je komplikovano u Postgres-u i nije potrebno 
    # jer su ovo validna stanja koja ne smetaju ako već postoje u bazi.
    pass