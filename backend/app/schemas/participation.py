from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.participation import ParticipationStatus

class ParticipationBase(BaseModel):
    game_id: int
    user_id: Optional[int] = None
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None  # <-- DODATO
    position: Optional[str] = None
    notes: Optional[str] = None

class ParticipationCreate(ParticipationBase):
    pass

class ParticipationUpdate(BaseModel):
    status: Optional[ParticipationStatus] = None
    position: Optional[str] = None
    guest_phone: Optional[str] = None  # <-- DODATO

class ParticipationResponse(ParticipationBase):
    id: int
    status: ParticipationStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)