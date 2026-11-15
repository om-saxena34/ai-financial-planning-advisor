import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start space-x-2.5 py-1">
      <div className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 shadow-xs flex-shrink-0">
        <Bot className="w-4 h-4 animate-pulse-subtle" />
      </div>
      <div className="bg-white border border-brand-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-xs flex items-center space-x-1.5">
        <span className="text-xs text-muted font-medium mr-1.5">Fin is thinking</span>
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
