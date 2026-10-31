from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models import Participation, Game, User
from app.models.participation import ParticipationStatus
from app.schemas import ParticipationCreate, ParticipationResponse
from app.services.game_processor import process_upcoming_games

router = APIRouter(prefix="/participations", tags=["participations"])

@router.post("/", response_model=ParticipationResponse, status_code=201)
def create_participation(
    participation: ParticipationCreate, 
    db: Session = Depends(get_db)
):
    # ✅ 1. Provera da li već postoji aktivna prijava sa istim imenom i telefonom za ovaj termin
    existing = db.query(Participation).filter(
        Participation.game_id == participation.game_id,
        Participation.guest_name == participation.guest_name,
        Participation.guest_phone == participation.guest_phone,
        Participation.status != ParticipationStatus.DECLINED # Ignoriši one koji su već otkazali
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Igrač '{participation.guest_name}' sa brojem '{participation.guest_phone}' je već prijavljen za ovaj termin!"
        )

    # 2. Ako ne postoji, kreiraj novu prijavu
    db_participation = Participation(**participation.model_dump())
    db.add(db_participation)
    db.commit()
    db.refresh(db_participation)
    return db_participation

@router.get("/game/{game_id}", response_model=list[ParticipationResponse])
def get_participations_for_game(game_id: int, db: Session = Depends(get_db)):
    return db.query(Participation).filter(Participation.game_id == game_id).all()

@router.patch("/{participation_id}/cancel")
def cancel_participation(participation_id: int, db: Session = Depends(get_db)):
    # Prvo obradi nadolazeće termine
    process_upcoming_games(db)
    
    participation = db.query(Participation).filter(Participation.id == participation_id).first()
    if not participation:
        raise HTTPException(status_code=404, detail="Prijava nije pronađena")
    
    if participation.status == ParticipationStatus.DECLINED:
        raise HTTPException(status_code=400, detail="Ova prijava je već otkazana")

    game = db.query(Game).filter(Game.id == participation.game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Termin nije pronađen")

    # Proveri da li je termin zaključan
    if game.status.value == 'locked':
        raise HTTPException(status_code=400, detail="Termin je zaključan - nije moguće otkazati prijavu")

    participation.status = ParticipationStatus.DECLINED
    db.commit()
    db.refresh(participation)
    
    return {
        "message": "Prijava je uspešno otkazana.",
        "participation_id": participation.id,
        "status": participation.status.value
    }