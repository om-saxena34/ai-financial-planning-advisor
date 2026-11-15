import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Friendly "What is this?" inline helper tooltip.
 * Explains money words in simple, 7th-grade English.
 */
export default function HelpTooltip({ text, title = 'What is this?' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex items-center ml-1 align-middle">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-brand-500 hover:text-brand-700 focus:outline-none transition-colors p-0.5 rounded"
        aria-label={`Learn more about ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-white text-ink text-xs rounded-xl shadow-card border border-brand-100 z-50 animate-fade-in pointer-events-none"
        >
          <span className="block font-semibold text-brand-700 mb-0.5">{title}</span>
          <span className="block text-ink-secondary leading-relaxed">{text}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white" />
        </span>
      )}
    </span>
  );
}
