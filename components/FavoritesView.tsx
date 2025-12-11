
import React from 'react';
import { ChatMessage } from '../types';

interface FavoritesViewProps {
  messages: ChatMessage[];
  onRemoveFavorite: (id: string) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ messages, onRemoveFavorite }) => {
  const favorites = messages.filter(m => m.isFavorite);

  return (
    <div className="h-full bg-stone-50 dark:bg-slate-900 p-8 overflow-y-auto font-arabic transition-colors">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400 mb-6 flex items-center gap-3">
          <span className="material-icons">star</span> Favorites
        </h2>
        
        {favorites.length === 0 ? (
          <div className="text-center py-20 text-stone-400 dark:text-stone-600">
            <span className="material-icons text-6xl mb-4 opacity-30">bookmark_border</span>
            <p>No favorite messages yet. Star a chat response to save it here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {favorites.map(msg => (
              <div key={msg.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 relative group">
                <button 
                  onClick={() => onRemoveFavorite(msg.id)}
                  className="absolute top-4 right-4 text-amber-500 hover:text-amber-600"
                  title="Remove from favorites"
                >
                  <span className="material-icons">star</span>
                </button>
                <div className="prose dark:prose-invert max-w-none text-stone-800 dark:text-stone-100 whitespace-pre-wrap">
                  {msg.text}
                </div>
                <div className="mt-4 text-xs text-stone-400 flex justify-between">
                   <span>{new Date(Number(msg.id)).toLocaleDateString()}</span>
                   <span>Model Response</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
