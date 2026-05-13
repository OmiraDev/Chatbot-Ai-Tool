import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "සුභ උදෑසනක් මචං! 🌅";
    if (hour < 18) return "සුභ දවසක් මචං! ☀️";
    return "සුභ රාත්‍රියක් මචං! 🌙";
  };

  useEffect(() => {
    setMessages([{ role: 'ai', text: `${getGreeting()} මම **මචං AI**. අද මොනවද අපි කරන්නේ?` }]);
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
      // 127.0.0.1 පාවිච්චි කිරීම ඉතාමත් ස්ථාවරයි
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
        updated[updated.length - 1].text = 'සර්වර් එකේ පොඩි අවුලක් මචං. 😓';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#080808] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar - Lankan Style */}
      <aside className="hidden lg:flex w-72 bg-[#141414] border-r border-[#800000]/30 flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#800000] rounded-xl flex items-center justify-center font-black text-white shadow-lg border border-[#FFD700]/20">M</div>
          <h1 className="text-xl font-black text-white">මචං <span className="text-[#FFD700]">AI</span></h1>
        </div>
        <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#800000] hover:bg-[#a00000] text-white rounded-xl font-bold shadow-lg transition-all">+ අලුත් Chat එකක්</button>
      </aside>

      {/* Chat Space */}
      <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl z-20">
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-100 uppercase tracking-wide">මචං සහකරු</span>
            <span className="text-[9px] text-[#FFD700] font-bold tracking-[0.3em] uppercase">Made in Sri Lanka</span>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 scrollbar-hide">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}>
                <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-[10px] font-black ${
                    msg.role === 'user' ? 'bg-[#222] text-slate-500' : 'bg-[#800000] text-white border border-[#FFD700]/20'
                  }`}>{msg.role === 'user' ? 'YOU' : 'මචං'}</div>
                  <div className={`p-6 rounded-[2.2rem] shadow-2xl ${msg.role === 'user' ? 'bg-[#800000] text-white' : 'bg-[#141414] text-slate-200 border border-white/5'}`}>
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && !messages[messages.length-1].text && (
              <div className="ml-14 text-[#FFD700] text-[9px] font-black tracking-widest uppercase animate-pulse">මචං ලියනවා...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-8">
          <div className="max-w-3xl mx-auto relative group">
            <div className="relative flex items-center bg-[#111] rounded-[2rem] border border-white/10 p-1.5">
              <input
                type="text"
                className="w-full p-4 bg-transparent outline-none text-slate-100 placeholder:text-slate-700 px-6"
                placeholder="මොකක්ද මචං වෙන්න ඕනේ?..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={loading} className="bg-[#800000] text-white px-6 py-3.5 rounded-[1.6rem] font-black text-[10px] uppercase tracking-widest shadow-xl">යවන්න</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;