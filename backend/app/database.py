from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Kreiraj engine (konekcija ka bazi)
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Automatski reconnect ako veza padne
    pool_size=10,        # Maksimalan broj konekcija u pool-u
    max_overflow=20      # Dodatne konekcije ako je pool pun
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base klasa za modele
Base = declarative_base()

def get_db():
    """
    Dependency za FastAPI endpoints.
    Obezbeđuje database sesiju i automatski je zatvara.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
