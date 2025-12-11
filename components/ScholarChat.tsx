
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, getSystemPrompt, Language } from '../types';
import { createChatSession } from '../services/geminiService';

interface ScholarChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  language: Language;
  onToggleFavorite: (msgId: string) => void;
  isDarkMode: boolean;
}

const ScholarChat: React.FC<ScholarChatProps> = ({ 
  messages, 
  setMessages, 
  language, 
  onToggleFavorite,
  isDarkMode 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Default to 'fast' mode
  const [mode, setMode] = useState<'deep' | 'fast'>('fast');
  const [useSearch, setUseSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      let model = 'gemini-3-pro-preview';
      if (mode === 'fast') {
        model = 'gemini-flash-lite-latest';
      }
      if (useSearch) {
        model = 'gemini-2.5-flash';
      }

      const systemPrompt = getSystemPrompt(language);

      // Create a chat session with history
      // Filter out messages with error/meta text if any, strictly pass history
      const history = messages.filter(m => m.id !== 'welcome'); 
      const chat = createChatSession(model, systemPrompt, history);

      const result = await chat.sendMessage({ message: userMsg.text });
      const text = result.text || "Sorry, I could not generate a response.";
      
      const sources: string[] = [];
      if (useSearch && result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        result.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push(chunk.web.uri);
          }
        });
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text,
        sources: sources.length > 0 ? sources : undefined,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I am having trouble accessing the knowledge base. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-slate-900 font-arabic transition-colors duration-300">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm relative group ${
              msg.role === 'user' 
                ? 'bg-emerald-700 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 dark:border-slate-700 border border-stone-200 text-stone-800 dark:text-stone-100 rounded-bl-none'
            }`}>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed font-arabic text-md md:text-lg">
                {msg.text}
              </div>
              
              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">Sources:</p>
                  <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-400">
                    {msg.sources.map((src, idx) => (
                      <li key={idx}><a href={src} target="_blank" rel="noopener noreferrer" className="hover:underline truncate block max-w-xs">{src}</a></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Actions Bar (Only for model messages) */}
            {msg.role === 'model' && msg.id !== 'welcome' && (
              <div className="flex items-center gap-2 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => handleCopy(msg.text)} 
                   className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-500 dark:text-stone-400"
                   title="Copy"
                 >
                   <span className="material-icons text-sm">content_copy</span>
                 </button>
                 <button 
                   onClick={() => onToggleFavorite(msg.id)}
                   className={`p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 ${msg.isFavorite ? 'text-amber-500' : 'text-stone-500 dark:text-stone-400'}`}
                   title="Favorite"
                 >
                   <span className="material-icons text-sm">{msg.isFavorite ? 'star' : 'star_border'}</span>
                 </button>
                 <button 
                   className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-500 dark:text-stone-400"
                   title="Share"
                   onClick={() => handleCopy(msg.text)} // Simple copy for share now
                 >
                   <span className="material-icons text-sm">share</span>
                 </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
               <span className="text-sm text-stone-400">
                 {mode === 'deep' ? "Thinking deeply..." : "Replying..."}
               </span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Footer */}
      <div className="text-center py-2 bg-stone-50 dark:bg-slate-900 text-[10px] text-stone-400 dark:text-stone-500">
        Al-Alim may make mistakes. Always verify important information with qualified scholars.
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-stone-200 dark:border-slate-700">
        {/* Controls Inline */}
        <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between text-xs">
           <div className="flex gap-2 bg-stone-100 dark:bg-slate-700 p-1 rounded-lg">
              <button 
                onClick={() => { setMode('fast'); setUseSearch(false); }}
                className={`px-3 py-1 rounded-md transition-all ${mode === 'fast' && !useSearch ? 'bg-white dark:bg-slate-600 shadow text-emerald-700 dark:text-emerald-300 font-bold' : 'text-stone-500 dark:text-stone-400'}`}
              >
                Fast
              </button>
              <button 
                onClick={() => { setMode('deep'); setUseSearch(false); }}
                className={`px-3 py-1 rounded-md transition-all ${mode === 'deep' && !useSearch ? 'bg-white dark:bg-slate-600 shadow text-emerald-700 dark:text-emerald-300 font-bold' : 'text-stone-500 dark:text-stone-400'}`}
              >
                Deep
              </button>
           </div>
           
           <button 
             onClick={() => setUseSearch(!useSearch)}
             className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors ${useSearch ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 text-blue-600' : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700'}`}
           >
             <span className="material-icons text-sm">search</span>
             <span>Web Search</span>
           </button>
        </div>

        <div className="max-w-4xl mx-auto flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about Islam, Quran, Hadith..."
            className="flex-1 border border-stone-300 dark:border-slate-600 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-slate-900 dark:text-white transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-all shadow-lg"
          >
            <span className="material-icons">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScholarChat;
