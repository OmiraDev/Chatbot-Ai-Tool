import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ශ්‍රී ලාංකීය ආචාරය
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "සුභ උදෑසනක් මචං! 🌅";
    if (hour < 18) return "සුභ දවසක් මචං! ☀️";
    return "සුභ රාත්‍රියක් මචං! 🌙";
  };

  useEffect(() => {
    setMessages([{ 
      role: 'ai', 
      text: `${getGreeting()} මම **මචං AI**. අද මොනවද අපි කරන්නේ?` 
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg, { role: 'ai', text: '' }]);
    setInput('');
    setLoading(true);

    try {
      // Hugging Face Backend URL එක
      const response = await fetch('https://omira01-chatbot-ai-backend.hf.space/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Connection failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = accumulatedText;
          return updated;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].text = 'සර්වර් එකේ පොඩි අවුලක් මචං. 😓 පොඩ්ඩක් චෙක් කරලා බලමුද?';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 font-sans overflow-hidden">
      
      {/* Sidebar - Sri Lankan Theme */}
      <aside className="hidden lg:flex w-72 bg-[#0c0c0c] border-r border-[#800000]/40 flex-col p-6 shadow-2xl z-30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 bg-gradient-to-br from-[#800000] to-[#EB7400] rounded-xl flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(128,0,0,0.5)] border border-[#FFD700]/30">M</div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tight">මචං <span className="text-[#FFD700]">AI</span></h1>
            <span className="text-[8px] text-[#FFD700]/60 font-bold uppercase tracking-[0.2em]">The Lankan Brain</span>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          className="w-full py-3.5 bg-gradient-to-r from-[#800000] to-[#a00000] hover:from-[#a00000] hover:to-[#800000] text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 border border-[#FFD700]/20"
        >
          + අලුත් Chat එකක්
        </button>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 px-2 py-3 bg-white/5 rounded-lg border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Engine Active</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Space */}
      <div className="flex-1 flex flex-col relative bg-[#080808]">
        
        {/* Decorative Background Watermark */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center overflow-hidden">
            <h1 className="text-[25vw] font-black rotate-[-15deg] select-none text-white">SRI LANKA</h1>
        </div>

        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-2xl z-20">
          <div className="flex items-center gap-4">
            {/* Sri Lankan Flag SVG Mini */}
            <div className="flex shadow-lg rounded-sm overflow-hidden border border-white/10">
                <div className="w-2 h-6 bg-[#EB7400]"></div>
                <div className="w-2 h-6 bg-[#00534E]"></div>
                <div className="w-8 h-6 bg-[#800000] flex items-center justify-center text-[8px]">🦁</div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-slate-100 text-sm tracking-wide uppercase">මචං සහකරු</span>
              <span className="text-[9px] text-[#FFD700] font-bold tracking-[0.2em] uppercase">Made with ❤️ in Sri Lanka</span>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-12 space-y-10 scroll-smooth relative z-10">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`flex gap-4 max-w-[92%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-[9px] font-black shadow-lg ${
                    msg.role === 'user' ? 'bg-[#1a1a1a] text-slate-500 border border-white/10' : 'bg-gradient-to-br from-[#800000] to-[#600000] text-white border border-[#FFD700]/30'
                  }`}>
                    {msg.role === 'user' ? 'YOU' : 'මචං'}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-6 rounded-[2rem] shadow-2xl transition-all ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-[#800000] to-[#900000] text-white rounded-tr-none' 
                      : 'bg-[#121212] text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && !messages[messages.length-1].text && (
              <div className="ml-14 flex items-center gap-2">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#EB7400] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#800000] rounded-full animate-bounce"></div>
                </div>
                <span className="text-[#FFD700] text-[9px] font-black tracking-widest uppercase">මචං හිතනවා...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Footer Input */}
        <footer className="p-8 bg-gradient-to-t from-[#050505] to-transparent z-20">
          <div className="max-w-3xl mx-auto relative group">
            <div className="relative flex items-center bg-[#111]/80 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-2 shadow-[0_10px_50px_rgba(0,0,0,0.5)] focus-within:border-[#800000]/50 transition-all">
              <input
                type="text"
                className="w-full p-4 bg-transparent outline-none text-slate-100 placeholder:text-slate-600 px-6 font-medium"
                placeholder="මොකක්ද මචං වෙන්න ඕනේ?..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend} 
                disabled={loading} 
                className="bg-gradient-to-r from-[#800000] to-[#EB7400] text-white px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:shadow-[#800000]/20 transition-all active:scale-95 disabled:opacity-50"
              >
                යවන්න
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;