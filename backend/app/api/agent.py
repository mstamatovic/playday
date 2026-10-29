from fastapi import APIRouter
from pydantic import BaseModel
from app.agent.tools import read_file, write_file, generate_code # Uvezi write_file

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentRequest(BaseModel):
    task: str
    files_to_read: list[str] = []
    target_file_path: str # <-- NOVO: Mi kažemo agentu gde da upiše fajl

@router.post("/generate-and-save")
async def generate_and_save_code(request: AgentRequest):
    # 1. Pročitaj kontekst
    context_parts = []
    for file_path in request.files_to_read:
        content = read_file.invoke({"file_path": file_path})
        context_parts.append(f"--- {file_path} ---\n{content}")
    
    context = "\n\n".join(context_parts)
    
    # 2. Generiši kod (LLM sada zna šta da radi)
    # (Ovde bi idealno LLM sam pozvao write_file, ali za pouzdanost, uradićemo to eksplicitno)
    code_prompt = f"ZADATAK: {request.task}\nKONTEKST: {context}\nGeneriši SAMO kod, bez markdown objašnjenja."
    generated_code = generate_code.invoke({"task_description": code_prompt, "context": ""})
    
    # Čišćenje odgovora (uklanjanje ```typescript ... ``` oznaka ako ih LLM doda)
    clean_code = generated_code.replace("```typescript", "").replace("```", "").strip()
    
    # 3. UPISI FAJL NA DISK! 🚀
    write_result = write_file.invoke({
        "file_path": request.target_file_path,
        "content": clean_code
    })
    
    return {
        "status": "success",
        "message": write_result,
        "target_file": request.target_file_path,
        "generated_code_preview": clean_code[:200] + "..." # Prikaži samo početak
    }