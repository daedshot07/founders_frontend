const USER_ID = "demo_user_001";
const API_BASE = "http://localhost:8000/api";

const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-chat-btn');
const memoryContainer = document.getElementById('memory-container');

// Chat history managed entirely by backend in a real app or passed locally
let chatHistory = [];

function appendMessage(role, content) {
    const isUser = role === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content; // Safe from XSS thanks to textContent
    
    msgDiv.appendChild(contentDiv);
    chatContainer.appendChild(msgDiv);
    scrollToBottom();
}

function appendTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.id = 'typing-indicator';
    indicatorDiv.className = 'typing-indicator message ai-message';
    
    indicatorDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    chatContainer.appendChild(indicatorDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderMemories(memories) {
    memoryContainer.innerHTML = '';
    
    if (!memories || memories.length === 0) {
        memoryContainer.innerHTML = '<div class="empty-state">No memories extracted yet. Try expressing a preference or objection!</div>';
        return;
    }
    
    memories.forEach(mem => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        
        const catClass = mem.category.toLowerCase() === 'objection' ? 'tag-objection' 
                       : mem.category.toLowerCase() === 'preference' ? 'tag-preference' 
                       : 'tag-fact';
        
        card.innerHTML = `
            <div class="memory-card-header">
                <span class="memory-tag ${catClass}">${mem.category}</span>
            </div>
            <div class="memory-card-content">${mem.content}</div>
        `;
        memoryContainer.appendChild(card);
    });
}

async function loadMemories() {
    try {
        // If serving via FastAPI static files, we can use relative paths or exact origin
        const res = await fetch(`/api/memories/${USER_ID}`);
        if (res.ok) {
            const data = await res.json();
            renderMemories(data);
        }
    } catch (e) {
        console.error("Failed to load memories", e);
    }
}

async function clearChat() {
    try {
        await fetch(`/api/memories/${USER_ID}`, { method: 'DELETE' });
        chatHistory = [];
        chatContainer.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    Hello! I'm your AI Sales Assistant. Your memory has been cleared. How can I help you today?
                </div>
            </div>
        `;
        renderMemories([]);
    } catch (e) {
        console.error("Failed to clear", e);
    }
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    chatInput.value = '';
    appendMessage('user', text);
    appendTypingIndicator();
    
    try {
        const payload = {
            user_id: USER_ID,
            message: text,
            history: chatHistory
        };
        
        // Use relative URL so it works seamlessly when hosted by FastAPI
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        removeTypingIndicator();
        
        if (response.ok) {
            const data = await response.json();
            appendMessage('assistant', data.message);
            chatHistory.push({ role: 'user', content: text });
            chatHistory.push({ role: 'assistant', content: data.message });
            
            // Reload memories entirely from backend
            loadMemories();
        } else {
            appendMessage('assistant', "Sorry, I encountered an error. Please try again.");
        }
    } catch (e) {
        removeTypingIndicator();
        appendMessage('assistant', "Network error. Make sure the backend is running.");
        console.error(e);
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});
clearBtn.addEventListener('click', clearChat);

// Init
window.addEventListener('DOMContentLoaded', loadMemories);
