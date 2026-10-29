from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, UserUpdate
from passlib.context import CryptContext # Napomena: zahteva 'passlib[bcrypt]' (instaliraćemo ga ako treba, za sada mock-ujemo hash)

router = APIRouter(prefix="/users", tags=["users"])

# Privremena funkcija za hashovanje (kasnije ćemo dodati pravu biblioteku)
def get_password_hash(password: str) -> str:
    return f"hashed_{password}" 

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Proveri da li email ili username već postoje
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email je već registrovan")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username je već zauzet")
    
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone=user.phone,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/", response_model=list[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(User).offset(skip).limit(limit).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return user