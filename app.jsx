import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const USER_ID = "hackathon_demo_v2";

function App() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your elite AI Sales Architect. How can I transform your workflow today?" }
    ]);
    const [profile, setProfile] = useState({
        sentiment: "Neutral", price_sensitivity: "Unknown", 
        intent_level: "Exploratory", primary_objection: "None Detectable"
    });
    const [memories, setMemories] = useState([]);
    const [strategy, setStrategy] = useState("Consultative Synthesis");
    const [isTyping, setIsTyping] = useState(false);
    
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`/api/dashboard/${USER_ID}`);
            if(res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setMemories(data.memories);
            }
        } catch(e) { console.error("Dashboard sync failed", e); }
    };

    const handleClear = async () => {
        await fetch(`/api/dashboard/${USER_ID}`, { method: 'DELETE' });
        setMessages([{ role: 'assistant', content: "Memory vault formatted. Awaiting fresh inputs." }]);
        setProfile({ sentiment: "Neutral", price_sensitivity: "Unknown", intent_level: "Exploratory", primary_objection: "None Detectable" });
        setMemories([]);
        setStrategy("Consultative Synthesis");
    };

    const handleSend = async (text) => {
        if(!text.trim()) return;
        const newMsg = { role: 'user', content: text };
        const updatedHistory = [...messages, newMsg];
        setMessages(updatedHistory);
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID, message: text, history: messages.slice(1) })
            });
            const data = await res.json();
            
            setMessages([...updatedHistory, { role: 'assistant', content: data.message }]);
            setProfile(data.user_profile);
            setStrategy(data.applied_strategy);
            
            fetchDashboard();
        } catch(e) {
            setMessages([...updatedHistory, { role: 'assistant', content: "Secure connection interrupted." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="w-full h-full flex p-4 lg:p-6 xl:p-8 relative gap-6 justify-center items-center">
            {/* Floating ambient orbs */}
            <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-blue-600/20 rounded-full blur-[120px] animate-float pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[20%] right-[10%] w-[25vw] h-[25vw] bg-purple-600/20 rounded-full blur-[100px] animate-float mix-blend-screen pointer-events-none" style={{animationDelay: '-3s'}}></div>
            
            {/* Master Layout */}
            <div className="w-full max-w-[1440px] h-full shadow-[0_0_50px_rgba(30,58,138,0.15)] rounded-3xl overflow-hidden glass-panel flex relative z-10 border border-slate-700/40">
                <LeftNavigation onNewChat={handleClear} />
                <ChatArea messages={messages} onSend={handleSend} isTyping={isTyping} messagesEndRef={messagesEndRef} />
                <InsightsSidebar profile={profile} memories={memories} strategy={strategy} />
            </div>
        </div>
    );
}

function LeftNavigation({ onNewChat }) {
    return (
        <div className="w-72 flex flex-col h-full bg-[#050B14]/80 border-r border-slate-800/60 p-6 backdrop-blur-xl">
            {/* Logo Area */}
            <div className="flex items-center gap-3 mb-12 transform hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 blur-md transform -translate-x-full hover:animate-[slide_2s_ease-in-out_infinite]"></div>
                    <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h1 className="font-extrabold text-2xl tracking-tight text-white mb-0.5"><span className="text-gradient">Hindsight</span></h1>
            </div>

            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">Command Center</p>
            
            <div className="space-y-1.5 mb-10">
                <NavItem icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>} label="Neurometric Grid" active />
                <NavItem icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} label="Entity Records" />
                <NavItem icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} label="Global Vectors" />
            </div>

            <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">Neural Streams</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-500/10 rounded-xl text-blue-400 cursor-pointer text-sm border border-blue-500/20 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.1)] group transition-all hover:bg-blue-500/20">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                            Entity #842_LIVE
                        </div>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 space-y-4">
                <button onClick={onNewChat} className="flex items-center justify-center gap-2 w-full bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl py-3.5 transition-all border border-slate-700 font-semibold text-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Initialize Vault
                </button>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active }) {
    return (
        <div className={`flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 text-[14px] font-semibold ${active ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white border-l-2 border-blue-500 shadow-[inset_10px_0_20px_rgba(59,130,246,0.05)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-2 border-transparent'}`}>
            <span className={active ? "text-blue-400" : "text-slate-500"}>{icon}</span>
            {label}
        </div>
    );
}

function ChatArea({ messages, onSend, isTyping, messagesEndRef }) {
    const [input, setInput] = useState('');

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0B1120]/60 relative border-r border-slate-800/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800/60 bg-[#0B1120]/40 backdrop-blur-xl flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700/50 shadow-inner relative">
                        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-pulse-ring"></div>
                        <span className="text-white font-extrabold text-sm tracking-widest">E-842</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Active Synthesis Protocol</h2>
                        <p className="text-[12px] text-blue-400 font-semibold flex items-center gap-2 mt-0.5 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6] animate-pulse"></span> Vector Link Established
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth z-10">
                <div className="text-center my-6 animate-enter">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 bg-slate-800/30 px-4 py-1.5 rounded-full border border-slate-700/30 backdrop-blur-sm">Secure Terminal</span>
                </div>

                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group max-w-4xl mx-auto w-full animate-enter`} style={{animationDelay: '100ms'}}>
                        {m.role === 'assistant' && (
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex-shrink-0 mr-4 mt-1 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                        )}
                        <div className={`max-w-[80%] px-6 py-4 text-[15px] leading-relaxed relative ${m.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl rounded-tr-md shadow-[0_10px_25px_rgba(30,58,138,0.3)]' : 'bg-[#1E293B]/80 backdrop-blur-md text-slate-200 rounded-3xl rounded-tl-md border border-slate-700/50 shadow-xl'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start max-w-4xl mx-auto w-full animate-enter">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex-shrink-0 mr-4 mt-1 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="bg-[#1E293B]/80 backdrop-blur-md rounded-3xl rounded-tl-md px-6 py-5 flex space-x-2 border border-slate-700/50 shadow-xl items-center">
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full typing-dot shadow-[0_0_8px_#60a5fa]"></div>
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full typing-dot shadow-[0_0_8px_#818cf8]"></div>
                            <div className="w-2.5 h-2.5 bg-purple-400 rounded-full typing-dot shadow-[0_0_8px_#a78bfa]"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="p-8 bg-[#0B1120]/80 backdrop-blur-xl border-t border-slate-800/60 z-20">
                <form onSubmit={(e) => { e.preventDefault(); onSend(input); setInput(''); }} className="max-w-4xl mx-auto relative flex items-center group">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Inject neural input..." 
                        className="w-full bg-[#1E293B]/70 border border-slate-700/80 text-white rounded-2xl pl-6 pr-16 py-5 focus:outline-none focus:border-blue-500 focus:bg-[#1E293B] transition-all shadow-inner font-medium placeholder-slate-500 text-[15px] hover:border-slate-600"
                    />
                    <button type="submit" disabled={!input.trim()} className={`absolute right-3 p-3 rounded-xl transition-all duration-300 ${input.trim() ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-105' : 'bg-slate-800 text-slate-500'}`}>
                        <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

function InsightsSidebar({ profile, memories, strategy }) {
    
    const getProgressValue = (val) => {
        if(["High", "Positive", "Ready to Buy"].includes(val)) return "w-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_#10b981]";
        if(["Medium", "Neutral", "Evaluating"].includes(val)) return "w-1/2 bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_#f59e0b]";
        if(["Low", "Negative", "Exploratory"].includes(val)) return "w-1/4 bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_#f43f5e]";
        return "w-0 bg-slate-700";
    }

    return (
        <div className="w-[380px] flex flex-col h-full bg-[#050B14]/80 border-l border-slate-800/60 backdrop-blur-xl">
            {/* Header */}
            <div className="px-8 py-7 border-b border-slate-800/60 flex justify-between items-center shadow-sm z-20">
                <h2 className="font-extrabold text-white tracking-tight flex items-center gap-3 text-lg">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Cognitive Engine
                </h2>
                <div className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-widest uppercase animate-pulse">Sync</div>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {/* Active Strategy Panel */}
                <div className="p-8 border-b border-slate-800/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] transform translate-x-10 -translate-y-10 group-hover:bg-blue-500/10 transition-colors duration-700"></div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-4 flex items-center gap-2">
                        Execution Protocol
                    </p>
                    <div className="bg-[#1E293B]/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
                        <p className="text-[14px] font-semibold text-slate-200 leading-relaxed pr-2">{strategy}</p>
                    </div>
                </div>

                {/* Telemetry Panel */}
                <div className="p-8 border-b border-slate-800/60 relative">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-6">Behavioral Telemetry</p>
                    
                    <div className="space-y-6">
                        <GaugeBar label="Sentiment Vector" value={profile.sentiment} barClass={getProgressValue(profile.sentiment)} />
                        <GaugeBar label="Conversion Intent" value={profile.intent_level} barClass={getProgressValue(profile.intent_level)} />
                        <GaugeBar label="Price Friction" value={profile.price_sensitivity === "High" ? "Low" : profile.price_sensitivity === "Low" ? "High" : "Medium"} barClass={getProgressValue(profile.price_sensitivity === "High" ? "Low" : profile.price_sensitivity === "Low" ? "High" : "Medium")} />
                        
                        <div className="pt-3">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Blocker</span>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold px-4 py-3.5 rounded-xl w-full flex items-center gap-3 backdrop-blur shadow-[inset_0_0_15px_rgba(244,63,94,0.05)] text-left leading-tight transition-all duration-500">
                                <div className="p-1.5 bg-rose-500/20 rounded-lg">
                                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <span className="flex-1 truncate">{profile.primary_objection}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hindsight Vault */}
                <div className="p-8 pb-12 relative min-h-[300px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/0 via-[#050B14]/50 to-[#050B14] pointer-events-none z-10 top-auto h-24"></div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-6 flex items-center justify-between">
                        Hindsight Index
                        <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded shadow-sm">{memories.length} Nodes</span>
                    </p>
                    
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-700 before:via-slate-800 before:to-transparent">
                        {memories.length === 0 && (
                            <div className="relative z-10 border border-dashed border-slate-700/60 bg-slate-800/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-enter backdrop-blur">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <span className="text-[13px] text-slate-400 font-semibold leading-relaxed">No memory nodes indexed.<br/>Awaiting interaction data.</span>
                            </div>
                        )}
                        {memories.map((m, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-enter z-10" style={{animationDelay: `${i * 100}ms`}}>
                                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#050B14] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-transform duration-300 group-hover:scale-125"></div>
                                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-[#1E293B]/60 backdrop-blur p-4 rounded-xl border border-slate-700/60 shadow-lg flex flex-col transition-all duration-300 hover:border-indigo-500/40 hover:bg-[#1E293B] hover:-translate-y-1">
                                    <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-indigo-400 mb-1.5 flex items-center gap-1.5">
                                        <span className="w-1 h-3 rounded-full bg-indigo-500 inline-block"></span>
                                        {m.category}
                                    </span>
                                    <p className="text-[13px] text-slate-200 leading-snug font-medium">{m.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GaugeBar({ label, value, barClass }) {
    return (
        <div className="group">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-widest">{label}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${barClass.includes('emerald') ? 'text-emerald-400' : barClass.includes('amber') ? 'text-amber-400' : barClass.includes('rose') ? 'text-rose-400' : 'text-slate-500'}`}>{value}</span>
            </div>
            <div className="w-full bg-[#0B1120] rounded-full h-2.5 overflow-hidden border border-slate-800/80 shadow-inner relative">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${barClass}`}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full transform -translate-x-full group-hover:animate-[slide_1.5s_ease-in-out_infinite]"></div>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
