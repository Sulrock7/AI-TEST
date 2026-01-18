
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { chatWithAuditor } from '../services/geminiService';

interface ChatBotProps {
  theme?: 'dark' | 'light';
}

const ChatBot: React.FC<ChatBotProps> = ({ theme = 'dark' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'model', text: 'حياك الله، أنا مساعد المهندس الشامل. كيف أقدر أخدمك اليوم بخصوص اشتراطات البناء؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithAuditor(userMessage, messages);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حصل خطأ بسيط. ممكن تعيد السؤال؟' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className={`w-[350px] sm:w-[400px] h-[550px] rounded-3xl shadow-2xl border flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-10 fade-in duration-300 transition-colors ${isDark ? 'bg-[#131d27] border-gray-800' : 'bg-white border-emerald-100'}`}>
          {/* Header */}
          <div className={`p-6 flex justify-between items-center border-b transition-colors ${isDark ? 'bg-emerald-900 border-gray-800 text-white' : 'bg-emerald-700 text-white border-emerald-800'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">مساعد المهندس الشامل</h3>
                <p className="text-[10px] opacity-70 font-black tracking-widest uppercase">الذكاء الاصطناعي الهندسي</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-grow overflow-y-auto p-6 space-y-4 transition-colors ${isDark ? 'bg-[#0a1118]' : 'bg-gray-50'}`}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : (isDark ? 'bg-[#1a2734] text-gray-100 border border-gray-700/50 rounded-bl-none' : 'bg-white text-gray-800 border border-emerald-100 rounded-bl-none')
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-4 rounded-2xl rounded-bl-none border ${isDark ? 'bg-[#1a2734] border-gray-700/50' : 'bg-white border-emerald-100'}`}>
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-5 border-t transition-colors ${isDark ? 'bg-[#131d27] border-gray-800' : 'bg-white border-emerald-50'}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اسألني عن أي اشتراط..."
                className={`flex-grow border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all font-bold ${isDark ? 'bg-[#0a1118] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-500 transition disabled:opacity-50 shadow-lg"
              >
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chatbot-toggle group relative p-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs px-4 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-black uppercase tracking-widest shadow-xl ${isDark ? 'bg-emerald-800 text-white' : 'bg-emerald-700 text-white'}`}>
            اسأل مساعد المهندس
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
