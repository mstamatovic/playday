from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """
    Konfiguracija aplikacije.
    Učitava vrednosti iz .env fajla automatski.
    """
    database_url: str
    secret_key: str
    debug: bool = False
    
    # ✅ Opciono: Ako Ollama nije prisutan u produkciji, ove vrednosti će biti None
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False

# Singleton instance
settings = Settings()