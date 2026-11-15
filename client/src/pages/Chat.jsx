import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import ChatDrawer from '../components/Chatbot/ChatDrawer';
import FloatingElements from '../components/common/FloatingElements';
import { Bot, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function Chat() {
  return (
    <PageWrapper
      title="Ask Fin"
      subtitle="Your friendly money helper. Ask calculations, affordability checks, or financial basics."
    >
      <FloatingElements count={2} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        {/* Left column: Quick guide & helpful prompts */}
        <div className="hidden lg:flex flex-col space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-card space-y-3">
            <div className="flex items-center space-x-2 text-brand-600">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-ink">What Fin Can Do</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-secondary">
              <li className="flex items-start gap-2">
                <span className="text-brand-500 font-bold">•</span>
                <span><strong>SIP Math:</strong> Ask "If I save ₹5k/mo for 10 yrs at 12%?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 font-bold">•</span>
                <span><strong>Affordability:</strong> Ask "Can I buy a laptop for ₹60,000?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 font-bold">•</span>
                <span><strong>Health Score:</strong> Ask "What is my Health Score?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 font-bold">•</span>
                <span><strong>Concept Explanations:</strong> Ask about Emergency Funds, Inflation, or Tax Saving.</span>
              </li>
            </ul>
          </div>

          <div className="bg-brand-50/70 p-4 rounded-2xl border border-brand-100/80 space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 text-brand-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe & Educational</span>
            </div>
            <p className="text-muted leading-relaxed text-[11px]">
              Fin runs on deterministic mathematical formulas and a curated 85+ personal finance knowledge base created for Invertis University evaluation.
            </p>
          </div>
        </div>

        {/* Right 3 columns: The Interactive Chat Window */}
        <div className="lg:col-span-3 h-full">
          <ChatDrawer isEmbedded={true} />
        </div>
      </div>
    </PageWrapper>
  );
}
