import os
from groq import Groq
from memory_engine import get_memories, add_memory, get_user_profile, save_user_profile
from pattern_detector import analyze_interaction
from models import ChatMessage, MemoryItem, UserProfile
from typing import List, Tuple

def get_client() -> Groq:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)

def determine_strategy(profile: UserProfile) -> str:
    """Dynamically determines the sales strategy based on the behavioral profile."""
    if profile.price_sensitivity == "High":
        return "Value-based Selling: Focus entirely on ROI, potential discounts, and the long-term cost benefits. Be extremely empathetic to budget concerns."
    if profile.intent_level == "Ready to Buy":
        return "Closing: The user is ready. Be direct, remove friction, and gently push towards the final conversion or trial."
    if profile.sentiment == "Negative":
        return "De-escalation & Empathy: The user is frustrated. Apologize for friction, listen closely, and do NOT push for a hard sale. Build trust."
    if "competitor" in profile.primary_objection.lower():
        return "Competitive Differentiation: Acknowledge the competitor but highlight our unique strengths (e.g. speed, memory engine, superior UX)."
    
    return "Consultative Selling: Ask open-ended questions, discover their core pain points, and gently guide them to our solution."

def generate_chat_response(user_id: str, message: str, history: List[ChatMessage]) -> Tuple[str, List[MemoryItem], UserProfile, str]:
    client = get_client()
    
    # 1. Retrieve Current State via Hindsight Semantic Recall
    past_memories = get_memories(user_id, limit=5, query=message)
    current_profile = get_user_profile(user_id) or UserProfile()
    
    # 2. Determine Strategy dynamically
    strategy = determine_strategy(current_profile)
    
    # 3. Construct System Prompt
    system_prompt = f"""You are an elite, adaptive AI Sales Agent representing a high-end software company.
    
YOUR CURRENT ADAPTIVE STRATEGY:
{strategy}

USER BEHAVIORAL PROFILE:
- Sentiment: {current_profile.sentiment}
- Price Sensitivity: {current_profile.price_sensitivity}
- Intent Level: {current_profile.intent_level}
- Primary Objection: {current_profile.primary_objection}

PAST MEMORIES (Context):
"""
    if past_memories:
        for mem in past_memories:
            system_prompt += f"- [{mem.category.upper()}] {mem.content}\n"
    else:
        system_prompt += "No past memories available. This is a fresh interaction.\n"
        
    system_prompt += "\nINSTRUCTIONS:\nUse the strategy and memories provided to craft a highly personalized response. Acknowledge their past friction points if relevant."

    # 4. Execute AI call for response
    messages = [{"role": "system", "content": system_prompt}]
    for h in history:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})
    
    response = client.chat.completions.create(
        messages=messages,
        model="llama-3.1-8b-instant"
    )
    ai_reply = response.choices[0].message.content
    
    # 5. Background Detection (Pattern Engine)
    new_profile, extracted_memory_dicts = analyze_interaction(client, message, ai_reply, current_profile)
    
    # 6. Save State
    save_user_profile(user_id, new_profile)
    
    saved_memories = []
    for mem_data in extracted_memory_dicts:
        cat = mem_data.get("category", "fact")
        content = mem_data.get("content", "")
        if content:
            mem = add_memory(user_id, cat, content)
            saved_memories.append(mem)
            
    return ai_reply, saved_memories, new_profile, strategy
