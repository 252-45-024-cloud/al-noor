
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ScholarChat from './components/ScholarChat';
import MediaStudio from './components/MediaStudio';
import LiveConversation from './components/LiveConversation';
import AudioTools from './components/AudioTools';
import QuranBrowser from './components/QuranBrowser';
import HadithBrowser from './components/HadithBrowser';
import TafsirReader from './components/TafsirReader';
import FavoritesView from './components/FavoritesView';
import LoginScreen from './components/LoginScreen';
import FeedbackModal from './components/FeedbackModal';
import { AppView, ChatMessage, User, Language, ChatSession } from './types';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // App State
  const [activeView, setActiveView] = useState<AppView>(AppView.SCHOLAR_CHAT);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default Dark
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // Initial Data Load (History & Theme)
  useEffect(() => {
    // Load History
    const savedSessions = localStorage.getItem('chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id); // Load most recent
        } else {
          createNewSession();
        }
      } catch (e) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
    
    // Load Theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Persist Sessions on Change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Theme Toggle Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Language Detection
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'bn') setLanguage(Language.BENGALI);
    else if (browserLang === 'ar') setLanguage(Language.ARABIC);
    else if (browserLang === 'ur') setLanguage(Language.URDU);
    else if (browserLang === 'id') setLanguage(Language.INDONESIAN);
    else setLanguage(Language.ENGLISH);
  }, []);

  // --- Session Management Logic ---

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        id: 'welcome',
        role: 'model',
        text: "As-salamu Alaykum. I am Al-Alim. How can I help you today?",
        timestamp: Date.now()
      }],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveView(AppView.SCHOLAR_CHAT);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    
    if (currentSessionId === id) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        createNewSession(); // Always have at least one session
      }
    }
    localStorage.setItem('chat_sessions', JSON.stringify(newSessions));
  };

  // Higher-order setter for messages to update the CURRENT session in the list
  const updateCurrentSessionMessages = (updateAction: React.SetStateAction<ChatMessage[]>) => {
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === currentSessionId) {
          const prevMessages = session.messages;
          const newMessages = typeof updateAction === 'function' 
            ? updateAction(prevMessages) 
            : updateAction;

          // Auto-Title Logic: If title is default and we have user messages
          let title = session.title;
          if (session.title === 'New Chat' && newMessages.length > 1) {
            const firstUserMsg = newMessages.find(m => m.role === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.text.slice(0, 35) + (firstUserMsg.text.length > 35 ? '...' : '');
            }
          }

          return {
            ...session,
            messages: newMessages,
            title: title,
            lastModified: Date.now()
          };
        }
        return session;
      });
    });
  };

  // Get current messages safely
  const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];

  // Global Favorite Handler
  const handleToggleFavorite = (msgId: string) => {
    updateCurrentSessionMessages(prev => prev.map(msg => 
      msg.id === msgId ? { ...msg, isFavorite: !msg.isFavorite } : msg
    ));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chat_sessions');
    setSessions([]);
    createNewSession();
  };

  const renderView = () => {
    switch (activeView) {
      case AppView.SCHOLAR_CHAT:
        return <ScholarChat 
          key={currentSessionId} // Force re-render on session switch
          messages={currentMessages} 
          setMessages={updateCurrentSessionMessages} 
          language={language}
          onToggleFavorite={handleToggleFavorite}
          isDarkMode={isDarkMode}
        />;
      case AppView.QURAN:
        return <QuranBrowser />;
      case AppView.TAFSIR:
        return <TafsirReader />;
      case AppView.HADITH:
        return <HadithBrowser />;
      case AppView.MEDIA_ANALYSIS:
        return <MediaStudio />; 
      case AppView.LIVE_CONVERSATION:
        return <LiveConversation />;
      case AppView.AUDIO_TOOLS:
        return <AudioTools />;
      case AppView.FAVORITES:
        // Aggregate all favorites from all sessions
        const allFavorites = sessions.flatMap(s => s.messages.filter(m => m.isFavorite));
        return <FavoritesView messages={allFavorites} onRemoveFavorite={handleToggleFavorite} />;
      default:
        return <ScholarChat 
          key={currentSessionId}
          messages={currentMessages} 
          setMessages={updateCurrentSessionMessages} 
          language={language}
          onToggleFavorite={handleToggleFavorite}
          isDarkMode={isDarkMode}
        />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-arabic transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewSession}
        onLoadSession={(id) => setCurrentSessionId(id)}
        onDeleteSession={deleteSession}
      />
      
      <main className="flex-1 h-full flex flex-col relative w-full bg-stone-50 dark:bg-slate-900">
         {/* Top Navigation Bar */}
         <header className="h-16 border-b border-stone-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-emerald-800 dark:text-emerald-500 md:hidden"
              >
                <span className="material-icons">menu</span>
              </button>
              
              <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-500 capitalize truncate max-w-[200px]">
                {activeView === AppView.SCHOLAR_CHAT 
                    ? (sessions.find(s => s.id === currentSessionId)?.title || 'Scholar Chat')
                    : activeView.replace('_', ' ')
                }
              </h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Selector */}
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-stone-100 dark:bg-slate-800 border-none rounded-lg text-xs md:text-sm px-2 py-1 outline-none cursor-pointer hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors max-w-[80px] md:max-w-none"
              >
                <option value={Language.ENGLISH}>En</option>
                <option value={Language.BENGALI}>বাংলা</option>
                <option value={Language.ARABIC}>عربي</option>
                <option value={Language.URDU}>اردو</option>
                <option value={Language.INDONESIAN}>ID</option>
              </select>

              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-300 transition-colors"
                title="Toggle Theme"
              >
                <span className="material-icons">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>

              {/* Feedback - Hidden on small mobile */}
              <button 
                onClick={() => setShowFeedback(true)}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-300 transition-colors hidden sm:block"
                title="Feedback"
              >
                <span className="material-icons">bug_report</span>
              </button>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-stone-600 hover:text-red-600 dark:text-stone-300 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <span className="material-icons">logout</span>
              </button>
            </div>
         </header>

         {/* Main Content */}
         <div className="flex-1 overflow-hidden relative w-full">
            {renderView()}
         </div>
      </main>
      
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* Google Material Icons CDN */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    </div>
  );
};

export default App;
