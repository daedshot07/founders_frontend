from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: List[ChatMessage] = []

class MemoryItem(BaseModel):
    id: Optional[int] = None
    user_id: str
    category: str  # objection, preference, intent, sentiment, fact
    content: str
    timestamp: Optional[str] = None

class UserProfile(BaseModel):
    sentiment: str = "Neutral" # Positive, Neutral, Negative
    price_sensitivity: str = "Unknown" # High, Medium, Low
    intent_level: str = "Exploratory" # Ready to Buy, Evaluating, Exploratory
    primary_objection: str = "None Detectable"

class ChatResponse(BaseModel):
    message: str
    extracted_memories: List[MemoryItem] = []
    user_profile: Optional[UserProfile] = None
    applied_strategy: str = "Standard Value Pitch"
