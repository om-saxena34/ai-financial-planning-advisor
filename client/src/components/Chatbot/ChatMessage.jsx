import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, User, Copy, Check, ArrowUpRight } from 'lucide-react';
import ChatCards from './ChatCards';

export default function ChatMessage({ message, onActionClick }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

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
      return { text: 'Want to experiment with numbers?', label: 'Open SIP Calculator', link: '/calculators/sip' };
    }
    if (hint === 'open_goals') {
      return { text: 'Ready to turn this into a plan?', label: 'Open Savings Goals', link: '/goals' };
    }
    if (hint === 'open_health_score') {
      return { text: 'See your complete wellness breakdown:', label: 'View Health Score', link: '/health-score' };
    }
    if (hint === 'open_what_if') {
      return { text: 'Test how this purchase shifts your savings:', label: 'Open What-If Simulator', link: '/what-if' };
    }
    if (hint === 'open_transactions') {
      return { text: 'Review all recent spending entries:', label: 'View Expenses', link: '/transactions' };
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

      <div className="max-w-[85%] sm:max-w-[80%] space-y-1.5">
        <div className="bg-white border border-brand-100 rounded-2xl rounded-tl-sm p-3.5 sm:p-4 shadow-card text-ink text-xs sm:text-sm leading-relaxed">
          {/* Main message text */}
          <div className="whitespace-pre-wrap text-ink font-body">{message.text}</div>

          {/* Interactive Card if present */}
          {message.card && <ChatCards card={message.card} onActionClick={onActionClick} />}

          {/* Action Hint if present */}
          {action && (
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

          {/* Educational disclaimer */}
          {message.disclaimer && (
            <p className="mt-2 text-[10px] text-muted italic border-t border-brand-50 pt-1.5">
              💡 {message.disclaimer}
            </p>
          )}
        </div>

        {/* Message meta actions */}
        <div className="flex items-center space-x-2 pl-1">
          {formattedTime && <span className="text-[10px] text-muted font-mono">{formattedTime}</span>}
          <button
            onClick={handleCopy}
            className="text-[10px] text-muted hover:text-brand-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy answer"
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
        </div>
      </div>
    </div>
  );
}
