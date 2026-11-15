import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Receipt,
  Target,
  Bot,
  Sparkles,
  Calculator,
  Brain,
  Sliders,
  BarChart3,
  HeartPulse,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const actions = [
    { id: 'dashboard', name: 'Dashboard', desc: 'See your complete money overview', path: '/dashboard', icon: LayoutDashboard },
    { id: 'expenses', name: 'Expenses & Spending', desc: 'Track what you spend and view transactions', path: '/transactions', icon: Receipt },
    { id: 'goals', name: 'Savings Goals', desc: 'Plan for a laptop, car, or emergency fund', path: '/goals', icon: Target },
    { id: 'chat', name: 'Ask Fin (AI Helper)', desc: 'Friendly financial Q&A, math and affordability', path: '/chat', icon: Bot },
    { id: 'tips', name: 'Smart Tips for You', desc: 'Personalized ideas to save more each month', path: '/recommendations', icon: Sparkles },
    { id: 'sip', name: 'SIP Wealth Calculator', desc: 'See how regular investing grows over time', path: '/calculators/sip', icon: Calculator },
    { id: 'compound', name: 'Compound Interest Math', desc: 'Calculate lump sum compound growth', path: '/calculators/compound', icon: Calculator },
    { id: 'health', name: 'Money Health Score', desc: 'Check your 0–100 financial wellness score', path: '/health-score', icon: HeartPulse },
    { id: 'insights', name: 'Behavior & Spending Pattern', desc: 'ML classification (Saver, Balanced, Overspender)', path: '/insights', icon: Brain },
    { id: 'what-if', name: 'What-If Simulator', desc: 'Test salary hikes or reduced spending', path: '/what-if', icon: Sliders },
    { id: 'metrics', name: 'ML Model Details (Viva)', desc: 'Confusion matrices, R² score and feature importances', path: '/model-metrics', icon: BarChart3 },
  ];

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredActions = actions.filter(
    (action) =>
      action.name.toLowerCase().includes(query.toLowerCase()) ||
      action.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleAskFin = () => {
    setIsOpen(false);
    navigate('/chat');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-brand-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-brand-100 bg-brand-50/50">
          <Search className="w-5 h-5 text-brand-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a page name or ask a question... (e.g. SIP, Goals, Health)"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-medium text-muted bg-white border border-brand-100 px-2 py-0.5 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {query.trim() && (
            <button
              onClick={handleAskFin}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/80 text-left transition-colors group border border-brand-100/60 bg-brand-50/30 mb-2"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Ask Fin: "{query}"</p>
                  <p className="text-[11px] text-muted">Get an instant AI answer with financial math</p>
                </div>
              </div>
              <CornerDownLeft className="w-3.5 h-3.5 text-brand-500 opacity-60 group-hover:opacity-100" />
            </button>
          )}

          {filteredActions.length === 0 && !query.trim() ? (
            <div className="p-4 text-center text-xs text-muted">Start typing to search pages or tools...</div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 text-left transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink">{action.name}</p>
                      <p className="text-[10px] text-muted">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-brand-50 bg-bg/50 flex items-center justify-between text-[11px] text-muted">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono text-[10px]">Press ⌘K / Ctrl+K anytime</span>
        </div>
      </div>
    </div>
  );
}
