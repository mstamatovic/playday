from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import Game, Participation
from app.models.game import GameStatus
from app.models.participation import ParticipationStatus

def process_upcoming_games(db: Session):
    """
    Proverava sve termine i automatski ih potvrđuje/zaključava 2 sata pre početka.
    """
    now = datetime.now(timezone.utc)
    two_hours_from_now = now + timedelta(hours=2)
    
    # Pronađi sve termine koji su u statusu 'draft' ili 'confirmed' i počinju za manje od 2 sata
    # ✅ ISPRAVKA: Koristimo .value da dobijemo string ("draft", "confirmed") umesto Enum-a
    upcoming_games = db.query(Game).filter(
        Game.date <= two_hours_from_now,
        Game.date > now,
        Game.status.in_([GameStatus.DRAFT.value, GameStatus.CONFIRMED.value])
    ).all()
    
    for game in upcoming_games:
        # Prebroj aktivne prijave (one koje nisu otkazane)
        active_players = db.query(Participation).filter(
            Participation.game_id == game.id,
            Participation.status != ParticipationStatus.DECLINED
        ).count()
        
        # Ako je ≥10 igrača, potvrdi termin
        if active_players >= 10:
            if game.status == GameStatus.DRAFT:
                game.status = GameStatus.CONFIRMED
                print(f"✅ Termin '{game.title}' potvrđen sa {active_players} igrača")
        else:
            # Ako je <10 igrača, otkaži termin
            if game.status == GameStatus.DRAFT:
                game.status = GameStatus.CANCELLED
                print(f"❌ Termin '{game.title}' otkazan - samo {active_players} igrača")
        
        # Zaključaj termin (bez obzira na status)
        game.status = GameStatus.LOCKED
        print(f"🔒 Termin '{game.title}' zaključan")
    
    # Takođe zaključaj sve termine čiji je početak prošao
    past_games = db.query(Game).filter(
        Game.date <= now,
        Game.status != GameStatus.LOCKED
    ).all()
    
    for game in past_games:
        game.status = GameStatus.LOCKED
        print(f"🔒 Termin '{game.title}' zaključan (prošao)")
    
    db.commit()