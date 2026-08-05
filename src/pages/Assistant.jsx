import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { FarmContext } from '../context/farm-context';
import { 
  chatWithAssistantApi, 
  fetchConversationsApi, 
  fetchConversationDetailApi,
  renameConversationApi,
  deleteConversationApi
} from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Bot, AlertTriangle, Lightbulb, Info, 
  Plus, MessageSquare, Trash2, Edit2, Check, X, Search, Copy, RefreshCw, Menu, Mic, StopCircle, Volume2, Pause, Play, Square, AudioLines, Headphones
} from 'lucide-react';

const Assistant = () => {
  const { selectedFarm } = useContext(FarmContext);
  
  // State
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversationId, setActiveConversationId] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Voice Modes & Speech
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [speechError, setSpeechError] = useState('');
  
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [playbackState, setPlaybackState] = useState('stopped'); // 'playing', 'paused', 'stopped'

  // Refs for callbacks to avoid stale state closures
  const recognitionRef = useRef(null);
  const voiceSilenceTimer = useRef(null);
  const latestTranscriptRef = useRef('');
  const retryCount = useRef(0);
  const isVoiceModeRef = useRef(isVoiceMode);
  const playbackStateRef = useRef(playbackState);
  const isLoadingRef = useRef(isLoading);
  
  const messagesEndRef = useRef(null);
  const sidebarRef = useRef(null);

  // Sync refs
  useEffect(() => { isVoiceModeRef.current = isVoiceMode; }, [isVoiceMode]);
  useEffect(() => { playbackStateRef.current = playbackState; }, [playbackState]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  // Safe wrapper for recognition start
  const safeStartRecognition = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.start();
    } catch (e) {
      // Ignore "already started" DOMExceptions
    }
  };

  const safeStopRecognition = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {}
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; 
        recognition.interimResults = true; 
        
        let finalTranscript = '';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError('');
          retryCount.current = 0; // reset retry
          // Capture whatever is currently in the input box so we don't overwrite it
          finalTranscript = latestTranscriptRef.current ? latestTranscriptRef.current + ' ' : '';
        };
        
        recognition.onresult = (event) => {
          // Barge-in: if AI is speaking, interrupt it
          if (playbackStateRef.current === 'playing') {
            handleStopAudio();
          }

          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          const combinedText = (finalTranscript + interimTranscript).trim();
          latestTranscriptRef.current = combinedText;
          setInput(combinedText);

          // Voice Mode Auto-Send (Silence Detection)
          if (isVoiceModeRef.current) {
            clearTimeout(voiceSilenceTimer.current);
            voiceSilenceTimer.current = setTimeout(() => {
              if (latestTranscriptRef.current.trim()) {
                handleSend(latestTranscriptRef.current.trim());
              }
            }, 2500); // 2.5 second silence timeout
          }
        };
        
        recognition.onerror = (event) => {
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission denied.');
            setIsListening(false);
            if (isVoiceModeRef.current) toggleVoiceMode(); // Disable voice mode
          } else if (event.error === 'no-speech' || event.error === 'network') {
            // Auto retry once if in voice mode
            if (isVoiceModeRef.current && retryCount.current < 1) {
              retryCount.current += 1;
              safeStartRecognition();
              return;
            } else if (!isVoiceModeRef.current) {
              setSpeechError(event.error === 'no-speech' ? 'No speech detected.' : 'Network error.');
              setIsListening(false);
            }
          } else if (event.error !== 'aborted') {
            setSpeechError(`Speech error: ${event.error}`);
            setIsListening(false);
          }
          setTimeout(() => setSpeechError(''), 4000);
        };
        
        recognition.onend = () => {
          setIsListening(false);
          // If voice mode is on, and we aren't loading an API response or playing audio, auto-restart listen
          if (isVoiceModeRef.current && !isLoadingRef.current && playbackStateRef.current !== 'playing') {
             safeStartRecognition();
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup Speech Synthesis & Timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(voiceSilenceTimer.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ---------------- Handlers ----------------

  const toggleVoiceMode = () => {
    if (!recognitionRef.current) {
      setSpeechError("Voice Mode not supported in this browser.");
      setTimeout(() => setSpeechError(''), 4000);
      return;
    }

    if (isVoiceMode) {
      // Turn OFF
      setIsVoiceMode(false);
      clearTimeout(voiceSilenceTimer.current);
      safeStopRecognition();
      handleStopAudio();
    } else {
      // Turn ON
      setIsVoiceMode(true);
      handleStopAudio(); // Stop any reading
      safeStartRecognition();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    // If they manually toggle mic while Voice Mode is on, we turn off Voice Mode
    if (isVoiceMode) setIsVoiceMode(false);

    if (isListening) {
      safeStopRecognition();
    } else {
      safeStartRecognition();
    }
  };

  // ---------------- Text-to-Speech Logic ----------------

  const stripMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/[*_#`~>]/g, '') 
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') 
      .replace(/\n/g, ' ') 
      .trim();
  };

  const detectLanguage = (text) => {
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
    return 'en-IN';
  };

  const handlePlayAudio = (id, text) => {
    if (!window.speechSynthesis) return;

    if (playingMessageId === id && playbackState === 'paused') {
      window.speechSynthesis.resume();
      setPlaybackState('playing');
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = stripMarkdown(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = detectLanguage(cleanText);
    
    utterance.onstart = () => {
      setPlayingMessageId(id);
      setPlaybackState('playing');
      // If voice mode is on, ensure mic is off while speaking to prevent echo loops
      if (isVoiceModeRef.current) {
         safeStopRecognition();
      }
    };
    
    utterance.onpause = () => setPlaybackState('paused');
    utterance.onresume = () => setPlaybackState('playing');

    utterance.onend = () => {
      setPlayingMessageId(null);
      setPlaybackState('stopped');
      // Auto-resume listening after AI finishes speaking in Voice Mode
      if (isVoiceModeRef.current && !isLoadingRef.current) {
         safeStartRecognition();
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
         setPlayingMessageId(null);
         setPlaybackState('stopped');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setPlaybackState('paused');
    }
  };

  const handleStopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      setPlaybackState('stopped');
    }
  };

  // ---------------- Core Chat Logic ----------------

  const location = useLocation();

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    handleStopAudio();
    if (activeConversationId) loadConversationDetails(activeConversationId);
    else startNewChat();
  }, [activeConversationId]);

  // Handle auto-send from URL parameter (e.g. from Notifications)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const promptMsg = params.get('prompt');
    if (promptMsg) {
       // Wait a tiny bit for chat to init
       setTimeout(() => {
         setInput(promptMsg);
         latestTranscriptRef.current = promptMsg;
         handleSend(promptMsg);
         
         // Clean URL silently
         window.history.replaceState({}, document.title, location.pathname);
       }, 500);
    }
  }, [location.search, activeConversationId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const data = await fetchConversationsApi();
      setConversations(data.results || data);
    } catch (err) {}
  };

  const loadConversationDetails = async (id) => {
    try {
      setIsLoading(true);
      const data = await fetchConversationDetailApi(id);
      if (data.messages && data.messages.length > 0) setMessages(data.messages);
      else startNewChat();
    } catch (err) {
      startNewChat();
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AgriNova AI Assistant. I can understand English, Hindi, and Gujarati. How can I help you with your farm today?',
      created_at: new Date().toISOString()
    }]);
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoadingRef.current) return;

    // Manual typing pause
    clearTimeout(voiceSilenceTimer.current);
    safeStopRecognition();
    handleStopAudio(); 

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    latestTranscriptRef.current = '';
    setIsLoading(true);

    try {
      const payload = {
        message: textToSend,
        farm_id: selectedFarm?.id || null,
        conversation_id: activeConversationId
      };

      const response = await chatWithAssistantApi(payload);
      
      if (!activeConversationId && response.conversation_id) {
        setActiveConversationId(response.conversation_id);
        loadConversations();
      }

      const aiMsg = {
        id: Date.now().toString() + 1,
        role: 'assistant',
        content: response.reply,
        metadata: {
          sources: response.sources,
          suggestions: response.suggestions,
          warnings: response.warnings,
          confidence: response.confidence
        },
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);

      // If in Voice Mode, auto-read the response
      if (isVoiceModeRef.current) {
         handlePlayAudio(aiMsg.id, aiMsg.content);
      }

    } catch (error) {
      const errorMsg = {
        id: Date.now().toString() + 2,
        role: 'assistant',
        content: "I'm sorry, I couldn't process that request. Please try again.",
        isError: true,
        lastFailedInput: textToSend,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      // If error in voice mode, turn mic back on
      if (isVoiceModeRef.current) safeStartRecognition();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (failedText) => {
    setMessages(prev => prev.filter(m => !m.isError));
    handleSend(failedText);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRename = async (id, newTitle) => {
    if (!newTitle.trim()) { setRenamingId(null); return; }
    try {
      await renameConversationApi(id, newTitle);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    } catch (err) {} finally { setRenamingId(null); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteConversationApi(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) startNewChat();
    } catch (err) {}
  };

  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickActions = [
    "🌤️ Should I irrigate my farm today?",
    "📈 What are the current market prices?",
    "🐛 Any disease risks for my crop?",
    "🌾 Give me a fertilizer recommendation."
  ];

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div 
        ref={sidebarRef}
        className={`absolute md:relative z-50 w-72 h-full bg-slate-50 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-4">
          <button
            onClick={() => { startNewChat(); setIsSidebarOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <p className="text-center text-xs text-slate-500 mt-4">No previous chats found.</p>
          ) : (
            filteredConversations.map(chat => (
              <div
                key={chat.id}
                onClick={() => { setActiveConversationId(chat.id); setIsSidebarOpen(false); }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeConversationId === chat.id 
                    ? 'bg-primary/10 text-primary dark:text-primary-light' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {renamingId === chat.id ? (
                  <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat.id, renameValue);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-primary px-2 py-1 rounded text-xs"
                    />
                    <button onClick={() => handleRename(chat.id, renameValue)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 p-1 rounded">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setRenamingId(null)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 p-1 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeConversationId === chat.id ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="text-sm truncate font-medium">{chat.title || 'New Chat'}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setRenamingId(chat.id); setRenameValue(chat.title); }}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(chat.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header with Voice Mode Toggle */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isVoiceMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 animate-pulse' : 'bg-primary/10 text-primary'}`}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                AI Farm Assistant 
                {isVoiceMode && <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full font-bold tracking-wider uppercase">Voice Mode Active</span>}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedFarm ? `Context: ${selectedFarm.name}` : 'No farm selected'}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleVoiceMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
              isVoiceMode 
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:border-rose-800/50 dark:text-rose-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-400'
            } border`}
          >
            <Headphones className={`w-4 h-4 ${isVoiceMode && playbackState === 'playing' ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{isVoiceMode ? 'Stop Voice Mode' : 'Start Voice Mode'}</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* Visual Voice Overlay */}
          <AnimatePresence>
            {isVoiceMode && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center"
              >
                <div className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg shadow-indigo-600/30 flex items-center gap-3 font-medium text-sm">
                  {playbackState === 'playing' ? (
                    <><AudioLines className="w-4 h-4 animate-pulse" /> AI is speaking...</>
                  ) : isListening ? (
                    <><Mic className="w-4 h-4 animate-pulse text-rose-200" /> Listening to you...</>
                  ) : isLoading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin text-indigo-200" /> Thinking...</>
                  ) : (
                    <><Headphones className="w-4 h-4" /> Voice Mode Active</>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {messages.map((msg) => {
              const isPlaying = playingMessageId === msg.id;

              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[90%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
                      ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                    >
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                      <div className={`px-5 py-3 rounded-2xl shadow-sm relative transition-all duration-300
                        ${msg.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-sm' 
                          : msg.isError 
                            ? 'bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 rounded-tl-sm'
                            : isPlaying
                              ? 'bg-primary/5 dark:bg-primary/10 text-slate-800 dark:text-slate-200 border border-primary/40 rounded-tl-sm ring-2 ring-primary/20 shadow-primary/10 shadow-md'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'}`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-a:text-primary">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}

                        {/* Error Retry Button */}
                        {msg.isError && msg.lastFailedInput && (
                          <button 
                            onClick={() => handleRetry(msg.lastFailedInput)}
                            className="mt-3 flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" /> Retry Message
                          </button>
                        )}

                        {/* Action Bar (Audio & Copy) */}
                        {msg.role === 'assistant' && !msg.isError && (
                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                            
                            {/* Audio Controls */}
                            {isPlaying ? (
                              <div className="flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg p-1 border border-primary/20">
                                <AudioLines className="w-4 h-4 text-primary animate-pulse ml-2" />
                                <span className="text-[10px] text-primary font-bold mr-1 uppercase tracking-widest">
                                  {playbackState === 'playing' ? 'Playing' : 'Paused'}
                                </span>
                                
                                {playbackState === 'playing' ? (
                                  <button 
                                    onClick={handlePauseAudio}
                                    className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-primary transition-all bg-white/50"
                                  >
                                    <Pause className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handlePlayAudio(msg.id, msg.content)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-primary transition-all bg-white/50"
                                  >
                                    <Play className="w-3.5 h-3.5 ml-0.5" />
                                  </button>
                                )}
                                <button 
                                  onClick={handleStopAudio}
                                  className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-rose-500 transition-all bg-white/50"
                                >
                                  <Square className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handlePlayAudio(msg.id, msg.content)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> <span>Listen</span>
                              </button>
                            )}

                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>

                            <button 
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                              {copiedId === msg.id ? (
                                <><Check className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-500">Copied</span></>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> <span>Copy</span></>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* AI Metadata Rendering */}
                      {msg.role === 'assistant' && msg.metadata && !msg.isError && (
                        <div className="flex flex-col gap-2 mt-1">
                          {msg.metadata.warnings && msg.metadata.warnings.length > 0 && (
                            <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-500 text-xs bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                              <span>{msg.metadata.warnings.join(' • ')}</span>
                            </div>
                          )}
                          {msg.metadata.sources && msg.metadata.sources.length > 0 && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Info className="w-3 h-3" />
                              <span>Sources: {msg.metadata.sources.join(', ')}</span>
                            </div>
                          )}
                          {msg.metadata.suggestions && msg.metadata.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {msg.metadata.suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSend(suggestion)}
                                  className="text-xs font-medium bg-white dark:bg-slate-800 border border-primary/30 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                >
                                  <Lightbulb className="w-3 h-3" /> {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {speechError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[90px] left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs px-4 py-2 rounded-full shadow-lg z-20 flex items-center gap-2"
            >
              <AlertTriangle className="w-3 h-3" />
              {speechError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4">
          
          {messages.length <= 1 && !isLoading && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action.replace(/^[^a-zA-Z]+/, '').trim())}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary active:scale-95 whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                latestTranscriptRef.current = e.target.value; // sync ref so voice silence timeout uses typed value if mixed
                // If user starts typing manually, pause listening
                if (isListening && !isVoiceMode) {
                   safeStopRecognition();
                } else if (isVoiceMode) {
                   clearTimeout(voiceSilenceTimer.current);
                   safeStopRecognition();
                   // It will resume automatically after send.
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isVoiceMode ? "Voice Mode: Speak to chat..." : isListening ? "Listening..." : "Ask about crops, weather in your language..."}
              className={`w-full pl-5 pr-[100px] py-4 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl focus:outline-none focus:ring-1 text-sm shadow-inner transition-all ${
                isVoiceMode 
                  ? 'border-indigo-400 focus:border-indigo-500 focus:ring-indigo-500 text-indigo-800 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : isListening 
                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary text-slate-800 dark:text-slate-200'
              }`}
              disabled={isLoading}
            />
            
            <div className="absolute right-2 flex items-center gap-1.5">
              {/* Normal Mic Button */}
              {!isVoiceMode && (
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                    isListening 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-rose-500/30' 
                      : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start dictation'}
                >
                  {isListening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            AI Assistant can make mistakes. Verify important agricultural decisions.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Assistant;
