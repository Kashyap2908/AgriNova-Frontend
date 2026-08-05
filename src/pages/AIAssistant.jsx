import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sprout, Info, Loader2, Wheat, Droplets, CloudSun, Target } from 'lucide-react';
import { FarmContext } from '../context/farm-context';
import { sendChatMessage } from '../services/assistantService';

const SUGGESTED_QUESTIONS = [
  { icon: Wheat, text: "Why are my cotton leaves turning yellow?" },
  { icon: Target, text: "Which crop is suitable for black soil?" },
  { icon: Droplets, text: "Should I irrigate today?" },
  { icon: CloudSun, text: "Is today's weather suitable for spraying?" }
];

const AIAssistant = () => {
  const { selectedFarm } = useContext(FarmContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hello! I am the AgriNova AI Assistant. I can help you with crop management, diseases, fertilizers, market prices, and farming practices. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e, forcedText = null) => {
    if (e) e.preventDefault();
    
    const textToSend = forcedText || inputValue.trim();
    if (!textToSend || isLoading) return;

    // Aggregate context payload
    const contextData = {
      active_farm_name: selectedFarm?.name || "Unknown Farm",
      location: `${selectedFarm?.village || ''}, ${selectedFarm?.district || ''}, ${selectedFarm?.state || ''}`,
      soil_type: selectedFarm?.soilType || "Unknown",
      water_availability: selectedFarm?.waterAvailability || "Unknown",
      farm_size: `${selectedFarm?.area || 0} ${selectedFarm?.areaUnit || 'Acres'}`,
    };

    // User Message UI Update
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Network Request to Backend
    const response = await sendChatMessage(textToSend, contextData);
    
    // Assistant Message UI Update
    const botMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: response.text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleSuggestedClick = (text) => {
    handleSendMessage(null, text);
  };

  // Simple Markdown renderer for lists/bold tags from LLM responses
  const formatText = (text) => {
    if (!text) return null;
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const paragraphs = formattedText.split('\n');
    
    return paragraphs.map((paragraph, idx) => {
      if (paragraph.trim().startsWith('* ') || paragraph.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc my-1" dangerouslySetInnerHTML={{ __html: paragraph.substring(2) }} />
        );
      }
      return (
        <p key={idx} className={`${paragraph.trim() === '' ? 'h-2' : 'mb-2'}`} dangerouslySetInnerHTML={{ __html: paragraph }} />
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex flex-col p-2 sm:p-4 lg:p-6 relative">
      
      {/* Banner */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">AgriNova AI</h1>
            <p className="text-xs text-slate-500 font-medium">Smart farming insights based on your farm context.</p>
          </div>
        </div>
        
        {selectedFarm ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <Info className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]">
              Context: <strong className="text-slate-800 dark:text-slate-200">{selectedFarm.name}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
            <Info className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              No farm selected. Advice will be generalized.
            </span>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl p-4 sm:p-6 mb-4 border border-slate-200 dark:border-slate-800 custom-scrollbar relative">
        
        {/* Suggested Questions (only show if no interaction yet) */}
        {messages.length === 1 && (
          <div className="mt-8 mb-12">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q.text)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <q.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                </div>

                {/* Bubble */}
                <div className={`px-5 py-4 rounded-3xl max-w-[85%] sm:max-w-[75%] shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                }`}>
                  <div className="text-[15px] leading-relaxed break-words">
                    {msg.role === 'user' ? msg.text : formatText(msg.text)}
                  </div>
                  <span className={`text-[10px] mt-2 block font-medium ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="px-5 py-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm flex items-center gap-1.5 w-20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-lg border border-slate-200 dark:border-slate-700 flex-shrink-0 z-10">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about crops, fertilizers, weather..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-5 py-4 outline-none border-none resize-none custom-scrollbar text-slate-800 dark:text-slate-200 min-h-[60px] max-h-[150px]"
            rows={1}
            style={{ 
              height: inputValue.length > 50 ? 'auto' : '60px',
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl flex items-center justify-center transition-all"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </form>
        <div className="text-center mt-2 pb-1">
          <span className="text-[10px] text-slate-400 font-medium">AgriNova AI Assistant may display inaccurate info. Always verify best practices.</span>
        </div>
      </div>

    </div>
  );
};

export default AIAssistant;
