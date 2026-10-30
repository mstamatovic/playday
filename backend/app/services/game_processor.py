from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import Game, Participation
from app.models.game import GameStatus
from app.models.participation import ParticipationStatus

def process_upcoming_games(db: Session):
    """
    Proverava sve termine i automatski ih potvrđuje ili otkaže 2 sata pre početka.
    """
    now = datetime.now(timezone.utc)
    two_hours_from_now = now + timedelta(hours=2)
    
    # Pronađi sve termine koji su u statusu 'draft' ili 'confirmed' i počinju za manje od 2 sata
    upcoming_games = db.query(Game).filter(
        Game.date <= two_hours_from_now,
        Game.date > now,
        Game.status.in_([GameStatus.DRAFT, GameStatus.CONFIRMED])
    ).all()
    
    for game in upcoming_games:
        # Prebroj aktivne prijave (one koje nisu otkazane)
        active_players = db.query(Participation).filter(
            Participation.game_id == game.id,
            Participation.status != ParticipationStatus.DECLINED
        ).count()
        
        # ✅ NOVA LOGIKA: Potvrdi ili Otkaži umesto Zaključaj
        if active_players >= 10:
            if game.status != GameStatus.CONFIRMED:
                game.status = GameStatus.CONFIRMED
                print(f"✅ Termin '{game.title}' je potvrđen (IGRA SE) sa {active_players} igrača")
        else:
            if game.status != GameStatus.CANCELLED:
                game.status = GameStatus.CANCELLED
                print(f"❌ Termin '{game.title}' je automatski OTKAZAN - samo {active_players} igrača")
    
    # Takođe, eksplicitno otkaži sve termine čiji je početak prošao, a nisu već otkazani
    past_games = db.query(Game).filter(
        Game.date <= now,
        Game.status != GameStatus.CANCELLED
    ).all()
    
    for game in past_games:
        # Ako je termin prošao, a nije bio otkazan, ostaje CONFIRMED (odigran je)
        # Ako želiš poseban status 'FINISHED', možeš ga dodati u Enum, ali za sada je CONFIRMED OK.
        pass
    
    db.commit()