import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getLabel = () => {
    if (theme === 'system') return `System (${resolvedTheme})`;
    if (theme === 'dark') return 'Dark Mode';
    return 'Light Mode';
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Current: ${getLabel()} — Click to cycle`}
      aria-label={`Toggle theme (current: ${getLabel()})`}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-xl border border-border bg-surface text-ink hover:bg-brand-50 hover:border-brand-300 transition-all shadow-xs ${className}`}
    >
      {theme === 'system' ? (
        <Monitor className="w-4 h-4 text-brand-500 animate-in fade-in" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="w-4 h-4 text-brand-400 animate-in spin-in-180" />
      ) : (
        <Sun className="w-4 h-4 text-warn animate-in spin-in-90" />
      )}
    </button>
  );
}
