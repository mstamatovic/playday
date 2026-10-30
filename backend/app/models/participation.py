import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class ParticipationStatus(enum.Enum):
    CONFIRMED = "confirmed"
    DECLINED = "declined"

# ✅ Team enum je definisan OVDE (jedini izvor istine)
class Team(enum.Enum):
    A = "A"
    B = "B"

class Participation(Base):
    __tablename__ = "participations"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_name = Column(String, nullable=True)
    guest_phone = Column(String, nullable=True)
    
    # Za status nam treba values_callable jer je ime "CONFIRMED" a vrednost "confirmed"
    status = Column(
        Enum(ParticipationStatus, values_callable=lambda x: [e.value for e in x], name="participationstatus"), 
        default=ParticipationStatus.CONFIRMED, 
        nullable=False
    )
    
    # ✅ ZA TEAM: Ime i vrednost su isti ("A" == "A"), ZATO UKLANJAMO values_callable!
    # Ovo rešava LookupError jer će SQLAlchemy sada ispravno mapirati Enum član.
    team = Column(Enum(Team, name="team"), nullable=True)
    
    position = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    game = relationship("Game", back_populates="participations")
    user = relationship("User", back_populates="participations")

    __table_args__ = (
        UniqueConstraint('game_id', 'user_id', name='unique_user_game'),
    )