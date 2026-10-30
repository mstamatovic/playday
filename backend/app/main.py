import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings  # ✅ Uvozimo settings da proverimo da li je Ollama konfigurisan

# Direktno uvozimo osnovne rutere
from app.api.users import router as users_router
from app.api.games import router as games_router
from app.api.participations import router as participations_router

app = FastAPI(
    title="Playday API",
    description="API za organizaciju fudbalskih termina",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Dinamički CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://192.168.1.203:5173,https://playday.rs,https://*.vercel.app")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uključi osnovne rutere
app.include_router(users_router)
app.include_router(games_router)
app.include_router(participations_router)

# ✅ USLOVNO: Uključi agent router SAMO ako su Ollama promenljive postavljene (npr. lokalno)
if settings.ollama_model and settings.ollama_base_url:
    from app.api.agent import router as agent_router
    app.include_router(agent_router)

@app.get("/")
def root():
    return {
        "message": "Playday API je aktivan",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}