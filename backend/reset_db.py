import sys
import os

# Dodaj current directory u path da bi importi radili
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine

# MORAMO da importujemo modele da bi Base.metadata znao za njih!
from app.models import user
from app.models import game
from app.models import participation

def reset_database():
    print("🔄 Povezivanje sa bazom...")
    try:
        print("🗑️  Brisanje svih postojećih tabela...")
        Base.metadata.drop_all(bind=engine)
        
        print("🏗️  Kreiranje tabela ispočetka (users, games, participations)...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ USPEH! Sve tabele su uspešno kreirane.")
    except Exception as e:
        print(f"❌ GREŠKA: {e}")

if __name__ == "__main__":
    reset_database()