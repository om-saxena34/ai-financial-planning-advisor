import React from 'react';
import { CheckCircle2, Circle, ArrowRight, ShieldCheck, HeartHandshake, Sparkles, TrendingUp, Compass } from 'lucide-react';

const STEP_ICONS = [
  Compass,
  ShieldCheck,
  TrendingUp,
  HeartHandshake,
  Sparkles,
];

export default function ReadinessLadder({ ladder, onActionClick }) {
  if (!ladder || !ladder.steps) return null;

  const { currentStep = 1, steps = [] } = ladder;

  return (
    <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="font-heading font-bold text-base text-ink">
              Financial Readiness Ladder
            </h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Step-by-step foundation before you take market risk. No rushing, zero pressure.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 self-start sm:self-auto">
          <span className="text-xs font-semibold text-brand-700">
            Currently on Step {currentStep} of 5
          </span>
        </div>
      </div>

      {/* 5-Step Progression Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
        {steps.map((st, idx) => {
          const isCompleted = st.completed;
          const isCurrent = st.step === currentStep;
          const StepIcon = STEP_ICONS[idx] || Compass;

          return (
            <div
              key={st.step}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-brand-50/70 border-brand-300 ring-2 ring-brand-400/20 shadow-xs'
                  : isCompleted
                  ? 'bg-surface border-good/30'
                  : 'bg-surface/50 border-brand-100/60 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-good text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white'
                      : 'bg-brand-100 text-muted'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.step}
                </span>

                <StepIcon
                  className={`w-4 h-4 ${
                    isCurrent ? 'text-brand-600' : isCompleted ? 'text-good' : 'text-muted'
                  }`}
                />
              </div>

              <h4 className="font-heading font-bold text-xs text-ink leading-tight">
                {st.title}
              </h4>
              <p className="text-[11px] text-muted mt-1 leading-snug line-clamp-2">
                {st.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-brand-50/80">
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    isCompleted
                      ? 'bg-good/10 text-good'
                      : isCurrent
                      ? 'bg-brand-500 text-white'
                      : 'bg-muted/10 text-muted'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : isCurrent ? 'Active Focus' : 'Upcoming'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Banner for Active Step */}
      {steps[currentStep - 1] && (
        <div className="bg-brand-50/50 rounded-xl p-3.5 border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-600">
              Next Small Win
            </span>
            <p className="text-xs text-ink font-medium">
              {steps[currentStep - 1].action}
            </p>
          </div>
          <span className="text-xs text-brand-700 bg-surface px-3 py-1 rounded-lg border border-brand-200 self-start sm:self-auto font-medium">
            Goal: {steps[currentStep - 1].unlockCriteria}
          </span>
        </div>
      )}
    </div>
  );
}
