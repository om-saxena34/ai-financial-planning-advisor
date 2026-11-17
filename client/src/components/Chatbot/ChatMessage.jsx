import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  User,
  Copy,
  Check,
  ArrowUpRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import ChatCards from './ChatCards';

export default function ChatMessage({
  message,
  onActionClick,
  onRegenerate,
  isLatest = false,
  isGenerating = false,
  onStopGenerating,
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike' | null
  const [displayedText, setDisplayedText] = useState(message.text || '');
  const [isTyping, setIsTyping] = useState(Boolean(message.isStreaming));

  const isUser = message.role === 'user';

  // Client-side smooth word-by-word typewriter effect for new bot responses
  useEffect(() => {
    if (isUser || !message.isStreaming || !message.text) {
      setDisplayedText(message.text || '');
      setIsTyping(false);
      return;
    }

    const words = message.text.split(' ');
    let currentIdx = 0;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      currentIdx += 1;
      setDisplayedText(words.slice(0, currentIdx).join(' '));

      if (currentIdx >= words.length) {
        clearInterval(interval);
        setIsTyping(false);
        if (message.onStreamDone) message.onStreamDone();
      }
    }, 22);

    return () => clearInterval(interval);
  }, [message.text, message.isStreaming, isUser]);

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard?.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const resolveAction = (hint) => {
    if (!hint) return null;
    if (typeof hint === 'object') return hint;
    if (hint === 'open_sip_calculator') {
      return { text: 'Experiment with your own numbers:', label: 'Open SIP Calculator', link: '/calculators/sip' };
    }
    if (hint === 'open_goals') {
      return { text: 'Turn this into an active target:', label: 'Open Savings Goals', link: '/goals' };
    }
    if (hint === 'open_health_score') {
      return { text: 'Check your overall wellness score:', label: 'View Health Score', link: '/health-score' };
    }
    if (hint === 'open_what_if') {
      return { text: 'Simulate changes to your budget:', label: 'Open What-If Simulator', link: '/what-if' };
    }
    if (hint === 'open_transactions') {
      return { text: 'Review all recent transactions:', label: 'View Expenses', link: '/transactions' };
    }
    if (hint === 'open_student_planner') {
      return { text: 'Plan semester fees and first salary:', label: 'Open Student Planner', link: '/student-planner' };
    }
    return null;
  };

  const action = resolveAction(message.actionHint);

  if (isUser) {
    return (
      <div className="flex justify-end items-end space-x-2 py-1">
        <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
          <div className="bg-brand-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-xs text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </div>
          {formattedTime && (
            <p className="text-[10px] text-muted text-right pr-1 font-mono">{formattedTime}</p>
          )}
        </div>
        <div className="w-7 h-7 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 flex-shrink-0 shadow-2xs">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-2.5 py-1.5 group">
      <div className="w-7 h-7 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-xs flex-shrink-0 mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      <div className="max-w-[88%] sm:max-w-[82%] space-y-1.5">
        <div className="bg-surface border border-brand-100 rounded-2xl rounded-tl-sm p-3.5 sm:p-4 shadow-card text-ink text-xs sm:text-sm leading-relaxed">
          {/* AI Mode badge */}
          {message.source === 'gemini_ai' && (
            <div className="flex items-center gap-1 text-[10px] text-brand-600 font-semibold mb-1.5">
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>Fin AI (Gemini)</span>
            </div>
          )}

          {/* Main message text with smooth typewriter effect */}
          <div className="whitespace-pre-wrap text-ink font-body leading-relaxed">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-brand-500 animate-pulse align-middle" />
            )}
          </div>

          {/* Interactive Card if present */}
          {message.card && !isTyping && (
            <ChatCards card={message.card} onActionClick={onActionClick} />
          )}

          {/* Action Hint if present */}
          {action && !isTyping && (
            <div className="mt-3 pt-2.5 border-t border-brand-50 flex items-center justify-between">
              <span className="text-[11px] text-muted">{action.text || 'Take action:'}</span>
              {action.link && (
                <Link
                  to={action.link}
                  onClick={onActionClick}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100 hover:bg-brand-100/60 transition-all shadow-2xs"
                >
                  {action.label || 'Open'}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          {/* Note or fallback indicator */}
          {message.note && !isTyping && (
            <p className="mt-2 text-[10px] text-muted border-t border-brand-50 pt-1.5 flex items-center gap-1">
              <span>ℹ️</span> {message.note}
            </p>
          )}

          {/* Educational disclaimer */}
          {message.disclaimer && !isTyping && (
            <p className="mt-2 text-[10px] text-muted italic border-t border-brand-50 pt-1.5">
              💡 {message.disclaimer}
            </p>
          )}
        </div>

        {/* Message Actions: Copy, Thumbs Up/Down, Regenerate */}
        <div className="flex items-center justify-between pl-1 pr-1 text-[11px] text-muted">
          <div className="flex items-center space-x-2">
            {formattedTime && <span className="text-[10px] font-mono">{formattedTime}</span>}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="text-[10px] text-muted hover:text-brand-600 flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-good" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>

            {/* Thumbs Up / Down Feedback */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setFeedback('like')}
                title="Helpful response"
                className={`p-1 rounded hover:bg-brand-50 transition-colors ${
                  feedback === 'like' ? 'text-good font-bold' : 'text-muted hover:text-ink'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => setFeedback('dislike')}
                title="Needs improvement"
                className={`p-1 rounded hover:bg-brand-50 transition-colors ${
                  feedback === 'dislike' ? 'text-bad font-bold' : 'text-muted hover:text-ink'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Regenerate if latest */}
          {isLatest && !isGenerating && onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Regenerate answer"
              className="text-[10px] text-muted hover:text-brand-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RotateCcw className="w-3 h-3" /> Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
