import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from sqlalchemy import text

# MORAMO da importujemo modele da bi Base.metadata znao za njih i pravilno kreirao ENUM-e!
from app.models import user
from app.models import game
from app.models import participation

def nuclear_reset():
    print("🔄 Povezivanje sa bazom...")
    try:
        with engine.connect() as conn:
            print("🗑️  Brisanje svih tabela...")
            Base.metadata.drop_all(bind=engine)
            
            print("🗑️  Prisilno brisanje starih ENUM tipova iz PostgreSQL-a...")
            conn.execute(text("DROP TYPE IF EXISTS gamestatus CASCADE;"))
            conn.execute(text("DROP TYPE IF EXISTS participationstatus CASCADE;"))
            conn.commit()
            
        print("🏗️  Kreiranje tabela i NOVIH, ispravnih ENUM tipova ispočetka...")
        # Sada će SQLAlchemy koristiti values_callable i kreirati enum sa 'draft', 'confirmed', itd.
        Base.metadata.create_all(bind=engine)
        
        print("✅ USPEH! Baza je potpuno čista i 100% sinhronizovana sa kodom.")
    except Exception as e:
        print(f"❌ GREŠKA: {e}")

if __name__ == "__main__":
    nuclear_reset()