import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any

from models import ChatRequest, ChatResponse, MemoryItem, UserProfile
from ai_service import generate_chat_response
from memory_engine import init_db, get_memories, clear_user_data, get_user_profile

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

app = FastAPI(title="Adaptive AI Sales Agent API (V2)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        reply_content, new_memories, updated_profile, strategy = generate_chat_response(
            user_id=request.user_id,
            message=request.message,
            history=request.history
        )
        return ChatResponse(
            message=reply_content,
            extracted_memories=new_memories,
            user_profile=updated_profile,
            applied_strategy=strategy
        )
    except Exception as e:
        print(f"Chat API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/{user_id}")
def get_dashboard_data(user_id: str):
    """Fetches the aggregated dashboard state for the sidebar UI."""
    memories = get_memories(user_id, limit=20)
    profile = get_user_profile(user_id) or UserProfile()
    return {
        "profile": profile.dict(),
        "memories": [m.dict() for m in memories]
    }

@app.delete("/api/dashboard/{user_id}")
def clear_dashboard_data(user_id: str):
    clear_user_data(user_id)
    return {"status": "success", "message": f"Data cleared for {user_id}"}
    
# Serve the React frontend natively!
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
