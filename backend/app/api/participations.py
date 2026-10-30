from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models import Participation, Game, User
from app.models.participation import ParticipationStatus
from app.schemas import ParticipationCreate, ParticipationResponse
from app.services.game_processor import process_upcoming_games

router = APIRouter(prefix="/participations", tags=["participations"])

@router.post("/", response_model=ParticipationResponse, status_code=status.HTTP_201_CREATED)
def create_participation(participation: ParticipationCreate, db: Session = Depends(get_db)):
    # Prvo obradi nadolazeće termine
    process_upcoming_games(db)
    
    game = db.query(Game).filter(Game.id == participation.game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Termin nije pronađen")
    
    # Proveri da li je termin zaključan
    if game.status.value == 'locked':
        raise HTTPException(status_code=400, detail="Termin je zaključan - nije moguće prijaviti se")

     # ✅ NOVO: Proveri da li je termin već popunjen
    active_players_count = db.query(Participation).filter(
        Participation.game_id == participation.game_id,
        Participation.status != ParticipationStatus.DECLINED
    ).count()

    if active_players_count >= game.max_players:
        raise HTTPException(status_code=400, detail="Prijavljen je maksimalan broj igrača. Proverite kasnije da li je neko otkazao prijavu ili kontaktirajte organizatora.  Hvala na razumevanju.")
   
    # if participation.user_id:
    #     user = db.query(User).filter(User.id == participation.user_id).first()
    #     if not user:
    #         raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    # ✅ NOVA PROVERA: Spreči dupliranje prijava (ista kombinacija imena i telefona)
    if participation.guest_name and participation.guest_phone:
        existing_participation = db.query(Participation).filter(
            Participation.game_id == participation.game_id,
            Participation.guest_name == participation.guest_name,
            Participation.guest_phone == participation.guest_phone,
            Participation.status != ParticipationStatus.DECLINED  # Ignoriši već otkazane prijave
        ).first()
        
        if existing_participation:
            raise HTTPException(
                status_code=400, 
                detail=f"Igrač '{participation.guest_name}' sa brojem '{participation.guest_phone}' je već prijavljen za ovaj termin!"
            )

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