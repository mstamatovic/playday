from sqlalchemy import Column, Integer, String, DateTime, Float, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class GameStatus(enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    LOCKED = "locked"
    CANCELLED = "cancelled"

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=False)
    address = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    max_players = Column(Integer, nullable=False)
    total_cost = Column(Float, nullable=False, default=0)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # ✅ OVO JE KLJUČNA ISPRAVKA: values_callable govori bazi da koristi "draft", a ne "DRAFT"
    status = Column(
        Enum(GameStatus, values_callable=lambda x: [e.value for e in x], name="gamestatus"), 
        default=GameStatus.DRAFT
    )
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organizer = relationship("User", back_populates="organized_games")
    participations = relationship("Participation", back_populates="game", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Game(id={self.id}, title={self.title}, status={self.status})>"