from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# ✅ UVOZIMO Team i ParticipationStatus iz modela (jedan izvor istine)
from app.models.participation import ParticipationStatus, Team

class ParticipationBase(BaseModel):
    game_id: int
    user_id: Optional[int] = None
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    team: Optional[Team] = None  # ✅ Sada koristi istu Team klasu kao i model
    position: Optional[str] = None
    notes: Optional[str] = None

class ParticipationCreate(ParticipationBase):
    pass

class ParticipationUpdate(BaseModel):
    status: Optional[ParticipationStatus] = None
    position: Optional[str] = None
    guest_phone: Optional[str] = None
    team: Optional[Team] = None

class ParticipationResponse(ParticipationBase):
    id: int
    status: ParticipationStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)