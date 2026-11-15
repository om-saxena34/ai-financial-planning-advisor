import React, { useState } from 'react';
import { Bot, MessageSquare, X, Sparkles } from 'lucide-react';
import ChatDrawer from './ChatDrawer';

export default function ChatbotLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setHasInteracted(true);
  };

  return (
    <>
      {/* Floating launcher trigger */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 group">
          {/* Subtle invitation pill */}
          {!hasInteracted && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-brand-100 rounded-full shadow-card text-xs font-medium text-ink animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse-subtle" />
              <span>Ask Fin about money</span>
            </div>
          )}

          <button
            onClick={handleToggle}
            aria-label="Open Fin AI Assistant"
            className="w-13 h-13 p-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-card hover:shadow-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 relative"
          >
            <Bot className="w-6 h-6" />
            {/* Online indicator dot */}
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-good border-2 border-white animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Drawer Modal */}
      {isOpen && <ChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
