import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Trash2,
  Maximize2,
  Sparkles,
  Square,
  RotateCcw,
} from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import QuickReplyChips from './QuickReplyChips';
import CornerDecor from '../common/CornerDecor';

export default function ChatDrawer({ isOpen = true, onClose, isEmbedded = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'What is SIP?',
    'What is my Health Score?',
    'Can I buy a phone for ₹30,000?',
    'How much should I keep for emergencies?',
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastUserMessageRef = useRef('');

  // Auto-scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Fetch initial history & suggestions
  useEffect(() => {
    if (!isOpen && !isEmbedded) return;

    let mounted = true;
    async function loadInitial() {
      try {
        const [histRes, suggRes] = await Promise.allSettled([
          chatbotService.getHistory(),
          chatbotService.getSuggestions(),
        ]);

        if (mounted && histRes.status === 'fulfilled' && histRes.value?.data?.history) {
          const rawHistory = histRes.value.data.history;
          if (rawHistory.length > 0) {
            setMessages(
              rawHistory.map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                text: m.text,
                card: m.card || m.cards?.[0] || null,
                actionHint: m.actionHint,
                disclaimer: m.disclaimer,
                source: m.source,
                timestamp: m.timestamp || new Date().toISOString(),
                isStreaming: false,
              }))
            );
          }
        }

        if (mounted && suggRes.status === 'fulfilled' && suggRes.value?.data?.suggestions) {
          setSuggestions(suggRes.value.data.suggestions);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }

    loadInitial();
    return () => {
      mounted = false;
    };
  }, [isOpen, isEmbedded]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, loading]);

  useEffect(() => {
    if ((isOpen || isEmbedded) && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isEmbedded]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    lastUserMessageRef.current = textToSend;
    setInput('');
    const userMsg = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatbotService.sendMessage(textToSend);
      if (res.success && res.data) {
        const botMsg = {
          role: 'assistant',
          text: res.data.text,
          card: res.data.card || res.data.cards?.[0] || null,
          actionHint: res.data.actionHint,
          disclaimer: res.data.disclaimer,
          source: res.data.source,
          note: res.data.note,
          isStreaming: true, // Trigger word typewriter
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);

        if (res.data.quickReplies && res.data.quickReplies.length > 0) {
          setSuggestions(res.data.quickReplies);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'I ran into a small issue understanding that. Could you please rephrase your question?',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't reach the server just now. Please make sure your backend is running.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStopGenerating = () => {
    setLoading(false);
  };

  const handleRegenerate = () => {
    if (lastUserMessageRef.current) {
      handleSend(lastUserMessageRef.current);
    }
  };

  const handleClearChat = async () => {
    if (messages.length === 0) return;
    try {
      await chatbotService.clearHistory();
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
      setMessages([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen && !isEmbedded) return null;

  return (
    <div
      className={
        isEmbedded
          ? 'w-full h-full flex flex-col bg-surface rounded-2xl border border-brand-100 shadow-card overflow-hidden relative'
          : 'fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[590px] max-h-[85vh] flex flex-col bg-surface rounded-2xl border border-brand-100 shadow-2xl overflow-hidden animate-fade-in'
      }
      role="dialog"
      aria-label="Fin Money Assistant"
    >
      {/* Soft background corner decor */}
      <CornerDecor variant="arc" position="top-right" opacity={0.3} />

      {/* Header */}
      <header className="px-4 py-3 bg-brand-50/80 border-b border-brand-100 flex items-center justify-between relative z-10 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-good border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-heading font-bold text-sm text-ink">Fin</h3>
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-brand-500" /> AI Advisor
              </span>
            </div>
            <p className="text-[11px] text-muted">Friendly money helper & planner</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 text-muted hover:text-bad rounded-lg hover:bg-surface transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {!isEmbedded && (
            <Link
              to="/chat"
              onClick={onClose}
              title="Open full page chat"
              className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-surface transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>
          )}

          {!isEmbedded && (
            <button
              onClick={onClose}
              title="Close chat"
              className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-bg/40 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 shadow-sm animate-float-slow">
              <Bot className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-base text-ink">Hello! I'm Fin.</h4>
              <p className="text-xs text-muted max-w-xs leading-relaxed">
                I can help you understand money, calculate SIP returns, plan semester fees, or see if you can afford a purchase!
              </p>
            </div>

            <div className="w-full pt-2">
              <p className="text-[11px] font-semibold text-ink-secondary mb-2">Try tapping a question below:</p>
              <div className="flex flex-col gap-1.5 text-left">
                {suggestions.slice(0, 3).map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sugg)}
                    className="text-xs p-2 rounded-xl bg-surface border border-brand-100 hover:border-brand-300 text-ink hover:text-brand-700 transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <span>{sugg}</span>
                    <span className="text-brand-400 group-hover:text-brand-600">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg}
              isLatest={idx === messages.length - 1}
              isGenerating={loading}
              onRegenerate={handleRegenerate}
              onActionClick={!isEmbedded ? onClose : undefined}
            />
          ))
        )}

        {loading && (
          <div className="flex items-center justify-between py-1">
            <TypingIndicator />
            <button
              onClick={handleStopGenerating}
              className="text-[11px] text-muted hover:text-bad flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full border border-brand-100 shadow-2xs transition-colors"
            >
              <Square className="w-2.5 h-2.5 fill-current" /> Stop
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer & Quick Chips */}
      <div className="p-2.5 bg-surface border-t border-brand-100 relative z-10 space-y-2 flex-shrink-0">
        <QuickReplyChips
          chips={suggestions}
          onSelect={(chip) => handleSend(chip)}
          disabled={loading}
        />

        <div className="flex items-center space-x-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Fin anything about money or planning..."
            disabled={loading}
            maxLength={300}
            className="flex-1 text-xs sm:text-sm bg-bg border border-brand-100 rounded-xl px-3.5 py-2 text-ink placeholder:text-muted focus:outline-none focus:border-brand-500 focus:bg-surface transition-all disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:hover:bg-brand-500 text-white flex items-center justify-center transition-all shadow-xs flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-muted text-center pt-0.5">
          Fin gives friendly learning tips, not formal investment advice.
        </p>
      </div>
    </div>
  );
}
