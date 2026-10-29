from langchain_core.tools import tool
from langchain_ollama import ChatOllama
from app.config import settings
import os

# Inicijalizacija lokalnog modela
llm = ChatOllama(
    base_url=settings.ollama_base_url,
    model=settings.ollama_model, # npr. "llama3.1:8b" ili "qwen2.5:7b"
    temperature=0.2 # Niska temperatura za preciznije generisanje koda
)

@tool
def read_file(file_path: str) -> str:
    """
    Čita sadržaj fajla iz projekta. 
    Koristi relativne putanje od root foldera backend-a (npr. 'app/models/game.py').
    """
    # Bezbednosna provera: dozvoli čitanje samo unutar backend foldera
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    safe_path = os.path.normpath(os.path.join(base_dir, file_path))
    
    if not safe_path.startswith(base_dir):
        return "Greška: Nebezbedna putanja fajla."
    
    try:
        with open(safe_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return f"Greška: Fajl '{file_path}' nije pronađen."
    except Exception as e:
        return f"Greška pri čitanju fajla: {str(e)}"

@tool
def generate_code(task_description: str, context: str) -> str:
    """
    Analizira zadatak i kontekst, a zatim KORISTI 'write_file' alat da sačuva kod.
    """
    prompt = f"""
    Ti si senior softverski inženjer specijalizovan za React, TypeScript i FastAPI.
    
    ZADATAK: {task_description}
    
    KONTEKST (Postojeći kod na koji se nadovezuješ):
    {context}
    
    PRAVILA PROJEKTA:
    1. Frontend komponente idu u 'frontend/src/components/'.
    2. Uvek koristi TypeScript (.tsx) i Tailwind CSS klase.
    3. Koristi 'useState' ili 'React Hook Form' za upravljanje formama.
    
    UPUTSTVO ZA IZVRŠENJE:
    1. Generiši kod u svojoj glavi.
    2. ODMAH nakon generisanja, MORAS da pozoveš 'write_file' alat sa tačnom putanjom (npr. 'frontend/src/components/MyComponent.tsx') i generisanim sadržajem.
    3. Vrati kratku poruku da je fajl sačuvan.
    """
    
    # Napomena: Da bi LLM mogao da pozove alat, moraš mu proslediti 'tools' parametar
    # Ovo zahteva malu izmenu u inicijalizaciji LLM-a ili korišćenje LLM-a sa tool-calling podrškom.
    
    response = llm.invoke(prompt)
    return response.content

@tool
def write_file(file_path: str, content: str) -> str:
    """
    Upisuje generisani kod direktno u fajl na disku.
    Koristi relativne putanje od ROOT foldera projekta (npr. 'frontend/src/components/GameForm.tsx').
    """
    # 1. Bezbednosna provera: dozvoli pisanje SAMO unutar 'playday' root foldera
    # __file__ je .../playday/backend/app/agent/tools.py
    # Četiri nivoa gore nas vraćaju u root 'playday' folder
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    # Normalizuj putanju da sprečimo directory traversal napade (npr. '../../../etc/passwd')
    safe_path = os.path.normpath(os.path.join(base_dir, file_path))
    
    if not safe_path.startswith(base_dir):
        return f"GREŠKA: Nebezbedna putanja fajla '{file_path}'. Dozvoljeno je pisanje samo unutar projekta."
    
    try:
        # 2. Kreiraj folder ako ne postoji (npr. ako pišemo u novi 'components' folder)
        os.makedirs(os.path.dirname(safe_path), exist_ok=True)
        
        # 3. Upisi sadržaj
        with open(safe_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        return f"USPEH: Fajl je uspešno kreiran/ažuriran na putanji: {safe_path}"
    except Exception as e:
        return f"GREŠKA pri upisivanju fajla: {str(e)}"