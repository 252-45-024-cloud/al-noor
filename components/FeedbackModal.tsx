
import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback:", text);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setText('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-4">Feedback / Report Bug</h3>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-stone-300 dark:border-slate-600 rounded-lg p-3 h-32 mb-4 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500"
              placeholder="Tell us what's wrong or suggest a feature..."
              required
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
              >
                Submit
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <span className="material-icons text-5xl text-emerald-500 mb-2">check_circle</span>
            <p className="text-stone-800 dark:text-white font-medium">Thank you for your feedback!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
