# Adaptive AI Sales Agent with Persistent Memory (V2 Hackathon Edition)

This is a top-1% hackathon project demonstrating an enterprise-grade AI Sales Agent. It transcends simple conversational wrappers by introducing a **Background Pattern Detection Engine**. Instead of just responding, it silently profiles the user's intent, sentiment, and objections to autonomously pivot its sales strategy.

## 🚀 The Core Innovation: "Memory as the Product"
Most AIs are entirely stateless. This system natively implements an aggressive *Hindsight Strategy*:
1. **The User Speaks:** The primary AI responds using the current strategy.
2. **The Background AI Listens:** A secondary pipeline parses the exchange, updating a global Semantic User Profile (Price Sensitivity, Sentiment, Core Objection).
3. **The Adaptation:** On the very next turn, the primary AI's system prompt dynamically morphs, altering its persuasion approach based strictly on the newly profiled telemetry.

## 🏗 System Architecture

```text
frontend/           <-- React 18, TailwindCSS (SaaS Dashboard UI)
backend/
 ├── main.py        <-- FastAPI Async Routes
 ├── ai_service.py  <-- Dynamic Strategy Prompting Engine
 ├── pattern_detector.py <-- Background LLM Profile Aggregator
 ├── memory_engine.py    <-- Persistent SQLite Memory Schema
 └── models.py      <-- Pydantic Data Validation
```

## ✨ Mandatory Hackathon Flow (Try This!)

### Turn 1: The Generic Contact
- **You:** "What is this software and how much does it cost?"
- **AI:** *(Executes 'Consultative Selling' strategy - generic positive response)*

### Turn 2: The Explicit Objection
- **You:** "That is too expensive for our small shop. We don’t have that kind of budget."
- **Observer (Sidebar):** Watch the *Insights Dashboard* dynamically flag you as `High Price Sensitivity` and change the active strategy to `Value-based Selling`.

### Turn 3: The Adaptive Pivot
- **You:** "What can you do for us?"
- **AI:** *(Executes 'Value-based Selling' strategy)* "Since budget is a major concern for your small shop, let me show you our highly discounted starter tier..."

## 🛠 Tech Stack
- **Backend**: Python, FastAPI
- **AI**: Groq API (High-speed LLaMA3 inference for sub-second branching logic)
- **Frontend**: React, TailwindCSS

## 🚀 Quick Start
1. Ensure your `.env` is supplied with your `GROQ_API_KEY`.
2. Run `pip install -r backend/requirements.txt`
3. Hit the VS Code 'Play' debugging button, or run:
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```
4. Travel to `http://localhost:8000` to interact with the Dashboard!
