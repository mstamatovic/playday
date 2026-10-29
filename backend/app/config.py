from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """
    Konfiguracija aplikacije.
    Učitava vrednosti iz .env fajla automatski.
    """
    database_url: str
    ollama_base_url: str
    ollama_model: str
    secret_key: str
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False

# Singleton instance
settings = Settings()
