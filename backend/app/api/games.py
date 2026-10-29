from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Game
from app.models.participation import Participation, ParticipationStatus
from app.schemas import GameCreate, GameResponse
from app.services.game_processor import process_upcoming_games

router = APIRouter(prefix="/games", tags=["games"])

@router.post("/", response_model=GameResponse, status_code=201)
def create_game(game: GameCreate, db: Session = Depends(get_db)):
    db_game = Game(**game.model_dump())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

@router.get("/", response_model=list[GameResponse])
def get_games(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Prvo obradi nadolazeće termine
    process_upcoming_games(db)
    
    games = db.query(Game).offset(skip).limit(limit).all()
    
    # Dodaj computed polja
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