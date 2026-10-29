from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.game import GameStatus

class GameBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    address: Optional[str] = None
    date: datetime
    duration_minutes: int
    max_players: int
    total_cost: float = 0  # NOVO
    organizer_id: int


class GameCreate(GameBase):
    organizer_id: int

class GameUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    date: Optional[datetime] = None
    max_players: Optional[int] = None
    status: Optional[GameStatus] = None

class GameResponse(GameBase):
    id: int
    status: str
    created_at: datetime
    current_players_count: int = 0  # COMPUTED
    current_cost_per_player: float = 0  # COMPUTED

    model_config = ConfigDict(from_attributes=True)