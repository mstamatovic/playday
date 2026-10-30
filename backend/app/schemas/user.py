from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.user import UserRole  # ✅ Uvozimo UserRole iz modela

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.USER  # ✅ NOVO: Default uloga je običan korisnik

class UserCreate(UserBase):
    password: str  # Koristi se samo pri registraciji

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None  # ✅ NOVO: Omogućava adminu da kasnije promeni ulogu

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)