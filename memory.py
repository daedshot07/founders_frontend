import sqlite3
from datetime import datetime
from typing import List
from models import MemoryItem

DB_PATH = "memories.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            category TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def add_memory(user_id: str, category: str, content: str) -> MemoryItem:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.utcnow().isoformat()
    cursor.execute(
        "INSERT INTO memories (user_id, category, content, timestamp) VALUES (?, ?, ?, ?)",
        (user_id, category, content, timestamp)
    )
    conn.commit()
    memory_id = cursor.lastrowid
    conn.close()
    
    return MemoryItem(
        id=memory_id,
        user_id=user_id,
        category=category,
        content=content,
        timestamp=timestamp
    )

def get_memories(user_id: str) -> List[MemoryItem]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, user_id, category, content, timestamp FROM memories WHERE user_id = ? ORDER BY timestamp DESC",
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [
        MemoryItem(id=row[0], user_id=row[1], category=row[2], content=row[3], timestamp=row[4])
        for row in rows
    ]

def clear_memories(user_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memories WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
