import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import CornerDecor from '../common/CornerDecor';
import ChatbotLauncher from '../Chatbot/ChatbotLauncher';
import CommandPalette from '../common/CommandPalette';

export default function PageWrapper({ children, title, subtitle, actions }) {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink relative overflow-x-hidden">
      {/* Soft background corner accent */}
      <CornerDecor variant="blob" position="top-right" opacity={0.25} />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {(title || actions) && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-ink">
                  {title}
                </h1>
              )}
              {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center space-x-3">{actions}</div>}
          </div>
        )}
        {children}
      </main>

      {/* Quick Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Floating Fin Assistant across all pages except full-page chat */}
      {!isChatPage && <ChatbotLauncher />}

      <footer className="border-t border-brand-100 bg-white py-6 text-center text-xs text-muted relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-warn">
            ⚠️ Learning project for Invertis University evaluation. This does not replace real financial advice.
          </p>
          <p>© {new Date().getFullYear()} FinWise — Friendly Money Planning</p>
        </div>
      </footer>
    </div>
  );
}
