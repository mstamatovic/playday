from typing import TypedDict
from langgraph.graph import StateGraph, END
from .tools import read_file, generate_code

# 1. Definiši stanje (State) koje se prosleđuje kroz graf
class AgentState(TypedDict):
    task: str               # Šta želimo da napravimo (npr. "Napravi React formu za Game")
    files_to_read: list[str] # Liste fajlova koje agent treba da pročita
    context: str            # Sadržaj pročitanjih fajlova
    generated_code: str     # Konačni generisani kod

# 2. Čvor: Analiza i prikupljanje konteksta
def analyze_node(state: AgentState) -> dict:
    context_parts = []
    for file_path in state.get("files_to_read", []):
        content = read_file.invoke({"file_path": file_path})
        context_parts.append(f"--- Sadržaj fajla: {file_path} ---\n{content}")
    
    joined_context = "\n\n".join(context_parts) if context_parts else "Nema dodatnog konteksta."
    return {"context": joined_context}

# 3. Čvor: Generisanje koda
def code_node(state: AgentState) -> dict:
    code = generate_code.invoke({
        "task_description": state["task"],
        "context": state["context"]
    })
    return {"generated_code": code}

# 4. Sastavi graf
workflow = StateGraph(AgentState)

workflow.add_node("analyze", analyze_node)
workflow.add_node("code", code_node)

# Definiši tok: analyze -> code -> KRAJ
workflow.set_entry_point("analyze")
workflow.add_edge("analyze", "code")
workflow.add_edge("code", END)

# Kompajliraj graf u izvršnu aplikaciju
agent_app = workflow.compile()