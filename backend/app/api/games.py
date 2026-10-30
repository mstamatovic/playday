from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.game import Game
from app.models.participation import Participation, ParticipationStatus
from app.schemas.game import GameCreate, GameResponse
from app.services.game_processor import process_upcoming_games
from app.dependencies import require_superadmin # ✅ Uvozimo našu zaštitu

router = APIRouter(prefix="/games", tags=["games"])

@router.post("/", response_model=GameResponse, status_code=201)
def create_game(
    game: GameCreate, 
    db: Session = Depends(get_db),
    _: bool = Depends(require_superadmin)
):
    # ✅ 1. KLJUČNA ISPRAVKA: Ukloni timezone info da bi bio kompatibilan sa bazom
    # Ako je datum "aware" (ima +01:00), pretvaramo ga u "naive" (običan datetime)
    new_start = game.date.replace(tzinfo=None) if game.date.tzinfo else game.date
    new_end = new_start + timedelta(minutes=game.duration_minutes)

    # 2. Tražimo sve termine na istoj lokaciji
    existing_games = db.query(Game).filter(Game.location == game.location).all()

    # 3. Proveravamo preklapanje (sada su svi datumi "naive" i mogu bezbedno da se porede)
    for existing in existing_games:
        existing_start = existing.date
        existing_end = existing_start + timedelta(minutes=existing.duration_minutes)

        if new_start < existing_end and new_end > existing_start:
            raise HTTPException(
                status_code=400, 
                detail=f"Termin se preklapa sa '{existing.title}' na ovoj lokaciji!"
            )

    # 4. Priprema podataka za čuvanje
    game_data = game.model_dump()
    game_data.pop("organizer_id", None) 
    
    # 5. Kreiramo termin
    db_game = Game(**game_data, organizer_id=1)
    
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

@router.get("/", response_model=list[GameResponse])
def get_games(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Prvo obradi nadolazeće termine (automatsko zaključavanje/otkazivanje)
    process_upcoming_games(db)
    
    games = db.query(Game).offset(skip).limit(limit).all()
    
    result = []
    for game in games:
        active_players = db.query(Participation).filter(
            Participation.game_id == game.id,
            Participation.status != ParticipationStatus.DECLINED
        ).count()
        
        cost_per_player = game.total_cost / active_players if active_players > 0 else 0
        
        game_dict = {
            "id": game.id,
            "title": game.title,
            "description": game.description,
            "location": game.location,
            "address": game.address,
            "date": game.date,
            "duration_minutes": game.duration_minutes,
            "max_players": game.max_players,
            "total_cost": game.total_cost,
            "organizer_id": game.organizer_id,
            "status": game.status.value,
            "created_at": game.created_at,
            "current_players_count": active_players,
            "current_cost_per_player": cost_per_player
        }
        result.append(game_dict)
    
    return result

@router.get("/{game_id}", response_model=GameResponse)
def get_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Termin nije pronađen")
    
    active_players = db.query(Participation).filter(
        Participation.game_id == game.id,
        Participation.status != ParticipationStatus.DECLINED
    ).count()
    
    cost_per_player = game.total_cost / active_players if active_players > 0 else 0
    
    return {
        "id": game.id,
        "title": game.title,
        "description": game.description,
        "location": game.location,
        "address": game.address,
        "date": game.date,
        "duration_minutes": game.duration_minutes,
        "max_players": game.max_players,
        "total_cost": game.total_cost,
        "organizer_id": game.organizer_id,
        "status": game.status.value,
        "created_at": game.created_at,
        "current_players_count": active_players,
        "current_cost_per_player": cost_per_player
    }

# ✅ NOVO: ZAŠTIĆENO - Samo Superadmin može da menja termin
@router.put("/{game_id}", response_model=GameResponse)
def update_game(
    game_id: int, 
    game_update: GameCreate, # Koristimo istu šemu za jednostavnost
    db: Session = Depends(get_db),
    _: bool = Depends(require_superadmin) # 🛡️ Zaštita
):
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Termin nije pronađen")

    # Ovde bi išla ista logika za preklapanje kao u create_game, 
    # ali preskačemo proveru za trenutni termin koji menjamo.
    
    for key, value in game_update.model_dump().items():
        setattr(db_game, key, value)
        
    db.commit()
    db.refresh(db_game)
    return db_game

# ✅ NOVO: ZAŠTIĆENO - Samo Superadmin može da briše termin
@router.delete("/{game_id}", status_code=204)
def delete_game(
    game_id: int, 
    db: Session = Depends(get_db),
    _: bool = Depends(require_superadmin) # 🛡️ Zaštita
):
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Termin nije pronađen")
    
    db.delete(db_game)
    db.commit()
    return None