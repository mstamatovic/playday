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
    total_cost: float = 0
    organizer_id: int
    # ✅ NOVO: Imena ekipa sa default vrednostima
    team_a_name: str = "Ekipa A"
    team_b_name: str = "Ekipa B"

class GameCreate(GameBase):
    organizer_id: int

class GameUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    date: Optional[datetime] = None
    max_players: Optional[int] = None
    status: Optional[GameStatus] = None
    team_a_name: Optional[str] = None
    team_b_name: Optional[str] = None

class GameResponse(GameBase):
    id: int
    status: str
    created_at: datetime
    current_players_count: int = 0
    current_cost_per_player: float = 0

    model_config = ConfigDict(from_attributes=True)