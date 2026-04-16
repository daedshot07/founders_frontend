import json
from groq import Groq
from models import UserProfile, MemoryItem
from typing import List, Tuple, Dict

def analyze_interaction(client: Groq, user_message: str, ai_reply: str, current_profile: UserProfile) -> Tuple[UserProfile, List[Dict]]:
    """
    Analyzes the user interaction using Groq LLM to update the user's behavioral profile
    and extract new discrete memories.
    """
    
    detector_prompt = f"""
You are an expert sales psychologist and data extraction engine.
Analyze the latest exchange between a user and an AI Sales Assistant.

Current User Profile:
- Sentiment: {current_profile.sentiment}
- Price Sensitivity: {current_profile.price_sensitivity}
- Intent Level: {current_profile.intent_level}
- Primary Objection: {current_profile.primary_objection}

LATEST EXCHANGE:
User: {user_message}
AI: {ai_reply}

TASK 1: Update the user profile based on this new exchange. 
Allowed values:
- sentiment: "Positive", "Neutral", "Negative"
- price_sensitivity: "High", "Medium", "Low", "Unknown"
- intent_level: "Ready to Buy", "Evaluating", "Exploratory"
- primary_objection: Briefly state the main blocker (e.g. "Too expensive", "Missing feature X"), or "None Detectable".

TASK 2: Extract specific, discrete memories that should be saved for future context.
Categories allowed: "objection", "preference", "intent", "sentiment", "fact".

You MUST return your response as a strictly valid JSON object matching this exact schema:
{{
    "updated_profile": {{
        "sentiment": "...",
        "price_sensitivity": "...",
        "intent_level": "...",
        "primary_objection": "..."
    }},
    "extracted_memories": [
        {{"category": "objection", "content": "The user thinks the enterprise tier is too expensive."}}
    ]
}}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": detector_prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        profile_data = data.get("updated_profile", {})
        memories = data.get("extracted_memories", [])
        
        new_profile = UserProfile(
            sentiment=profile_data.get("sentiment", current_profile.sentiment),
            price_sensitivity=profile_data.get("price_sensitivity", current_profile.price_sensitivity),
            intent_level=profile_data.get("intent_level", current_profile.intent_level),
            primary_objection=profile_data.get("primary_objection", current_profile.primary_objection)
        )
        
        return new_profile, memories
        
    except Exception as e:
        print(f"Pattern Detector Error: {e}")
        return current_profile, []
