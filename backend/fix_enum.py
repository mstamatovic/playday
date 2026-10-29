import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def fix_enum():
    print("🔄 Povezivanje sa bazom...")
    try:
        with engine.connect() as conn:
            print("🗑️  Brisanje starog, zastarelog 'gamestatus' ENUM tipa iz PostgreSQL-a...")
            # CASCADE je važan jer briše i sve zavisnosti (poput kolone u tabeli games)
            conn.execute(text("DROP TYPE IF EXISTS gamestatus CASCADE;"))
            conn.commit()
        print("✅ USPEH! Stari ENUM je trajno obrisan.")
        print("👉 SADA ODMAH POKRENI: python reset_db.py")
    except Exception as e:
        print(f"❌ GREŠKA: {e}")

if __name__ == "__main__":
    fix_enum()