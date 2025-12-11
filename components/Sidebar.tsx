
import React from 'react';
import { AppView, ChatSession } from '../types';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  
  // History Props
  sessions?: ChatSession[];
  currentSessionId?: string;
  onNewChat?: () => void;
  onLoadSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isOpen, 
  onClose,
  sessions = [],
  currentSessionId,
  onNewChat,
  onLoadSession,
  onDeleteSession
}) => {
  const navItems = [
    { id: AppView.SCHOLAR_CHAT, label: 'Scholar Chat', icon: '📖' }, 
    { id: AppView.QURAN, label: 'Al-Quran', icon: '☪️' }, 
    { id: AppView.TAFSIR, label: 'Tafsir', icon: '📜' }, 
    { id: AppView.HADITH, label: 'Sahih Bukhari', icon: '📚' }, 
    { id: AppView.LIVE_CONVERSATION, label: 'Live Talk', icon: '🎙️' }, 
    { id: AppView.MEDIA_ANALYSIS, label: 'Media Analysis', icon: '👁️' }, 
    { id: AppView.AUDIO_TOOLS, label: 'Audio Tools', icon: '🔊' }, 
    { id: AppView.FAVORITES, label: 'Favorites', icon: '⭐' },
  ];

  const handleItemClick = (id: AppView) => {
    setActiveView(id);
    onClose();
  };

  const handleSessionClick = (id: string) => {
    if (onLoadSession) onLoadSession(id);
    setActiveView(AppView.SCHOLAR_CHAT);
    onClose();
  };

  // Group sessions logic
  const groupSessions = () => {
    const groups: { [key: string]: ChatSession[] } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    sessions.forEach(session => {
      const date = new Date(session.lastModified);
      
      if (date.toDateString() === today.toDateString()) {
        groups['Today'].push(session);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(session);
      } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups['Older'].push(session);
      }
    });

    // Sort descending
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.lastModified - a.lastModified);
    });

    return groups;
  };

  const groupedSessions = groupSessions();

  return (
    <>
      {/* Sidebar container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-emerald-950 dark:bg-slate-900 text-stone-300 h-screen flex flex-col shadow-2xl font-sans transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-emerald-900 dark:border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header & New Chat */}
        <div className="p-4 flex flex-col gap-4 bg-emerald-950/50 dark:bg-slate-900/50">
          <div className="flex justify-between items-center px-1">
            <div>
               <h1 className="text-xl font-bold text-amber-400 tracking-tight">Al-Alim</h1>
               <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest opacity-80">Islamic AI</p>
            </div>
            <button onClick={onClose} className="md:hidden text-stone-400 hover:text-white">
              <span className="material-icons">close</span>
            </button>
          </div>

          <button 
            onClick={onNewChat}
            className="flex items-center gap-3 px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-900/20 group active:scale-95"
          >
            <span className="material-icons text-xl group-hover:rotate-90 transition-transform">add</span>
            <span className="font-semibold text-sm">New Chat</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar space-y-6">
          
          {/* Main Navigation */}
          <div>
             <p className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Menu</p>
             <div className="space-y-0.5">
               {navItems.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-800/50 dark:bg-slate-800 text-white font-medium shadow-sm'
                          : 'hover:bg-emerald-900/50 dark:hover:bg-slate-800/50 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  )
               })}
             </div>
          </div>

          {/* History Sections */}
          {Object.entries(groupedSessions).map(([label, group]) => (
            group.length > 0 && (
              <div key={label}>
                <p className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 sticky top-0 bg-emerald-950 dark:bg-slate-900 z-10 py-1">{label}</p>
                <div className="space-y-0.5">
                  {group.map(session => (
                    <div 
                      key={session.id}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id && activeView === AppView.SCHOLAR_CHAT
                          ? 'bg-emerald-800/30 dark:bg-slate-800 text-stone-100' 
                          : 'hover:bg-emerald-900/30 dark:hover:bg-slate-800/30 text-stone-400 hover:text-stone-200'
                      }`}
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <span className="material-icons text-[16px] opacity-70">chat_bubble_outline</span>
                      <span className="text-sm truncate pr-6 flex-1">{session.title}</span>
                      
                      {/* Delete Action */}
                      <button 
                        onClick={(e) => onDeleteSession && onDeleteSession(session.id, e)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-stone-500 transition-opacity"
                        title="Delete Chat"
                      >
                        <span className="material-icons text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-emerald-900 dark:border-slate-800 bg-emerald-950 dark:bg-slate-900">
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-xs text-white font-bold shadow-lg">U</div>
               <div className="flex-1 overflow-hidden">
                   <p className="text-sm font-medium text-stone-200 truncate">User Account</p>
                   <p className="text-[10px] text-stone-500">Free Plan</p>
               </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
