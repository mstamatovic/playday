from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

# ✅ POJEDNOSTAVLJEN STATUS: Samo 'confirmed' (aktivan) i 'declined' (otkazan)
class ParticipationStatus(enum.Enum):
    CONFIRMED = "confirmed"
    DECLINED = "declined"

class Participation(Base):
    __tablename__ = "participations"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_name = Column(String, nullable=True)
    guest_phone = Column(String, nullable=True)
    
    # ✅ Default je odmah CONFIRMED
    status = Column(
        Enum(ParticipationStatus, values_callable=lambda x: [e.value for e in x], name="participationstatus"), 
        default=ParticipationStatus.CONFIRMED, 
        nullable=False
    )
    
    position = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    game = relationship("Game", back_populates="participations")
    user = relationship("User", back_populates="participations")

    __table_args__ = (
        UniqueConstraint('game_id', 'user_id', name='unique_user_game'),
    )