import React from 'react';
import { Sparkles } from 'lucide-react';

export default function QuickReplyChips({ chips = [], onSelect, disabled = false }) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none no-scrollbar">
      <span className="text-[11px] text-muted flex-shrink-0 flex items-center gap-1 font-medium pl-1">
        <Sparkles className="w-3 h-3 text-brand-500" /> Suggestions:
      </span>
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelect && onSelect(chip)}
          className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-brand-50/70 hover:bg-brand-100/70 text-brand-700 border border-brand-100 hover:border-brand-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs active:scale-95"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
