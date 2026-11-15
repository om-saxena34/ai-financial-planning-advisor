import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Target, HeartPulse, Receipt, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function formatRupee(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export default function ChatCards({ card, onActionClick }) {
  if (!card || !card.type) return null;
  const data = card.data || card;

  switch (card.type) {
    case 'sip_calculation': {
      const { monthlyAmount, annualRate, years, totalInvested, wealthGain, futureValue } = data;
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100 shadow-xs text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <Calculator className="w-3.5 h-3.5 text-brand-500" />
              SIP Math Breakdown
            </span>
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full">
              {years} Years @ {annualRate}% p.a.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-brand-100/60 text-center">
            <div>
              <p className="text-[10px] text-muted">Monthly</p>
              <p className="font-bold text-ink mt-0.5">{formatRupee(monthlyAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">You Put In</p>
              <p className="font-bold text-ink mt-0.5">{formatRupee(totalInvested)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Growth Gain</p>
              <p className="font-bold text-good mt-0.5">+{formatRupee(wealthGain)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-brand-500/10 p-2.5 rounded-xl border border-brand-500/20">
            <div>
              <p className="text-[10px] text-brand-700 font-medium">Estimated Future Total</p>
              <p className="text-sm font-heading font-extrabold text-brand-700">{formatRupee(futureValue)}</p>
            </div>
            <Link
              to="/calculators/sip"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-white px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs hover:shadow-xs transition-all"
            >
              Full Calculator <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    case 'affordability': {
      const { itemCost, monthlySurplus, monthsToSave, isAffordable, message } = data;
      const isOk = isAffordable;
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              {isOk ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-good" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-warn" />
              )}
              Affordability Assessment
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOk ? 'bg-good/10 text-good' : 'bg-warn/10 text-warn'
              }`}
            >
              {isOk ? 'Within Budget' : 'Planning Needed'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-brand-100/60">
            <div>
              <p className="text-[10px] text-muted">Cost of Item</p>
              <p className="font-bold text-ink mt-0.5">{formatRupee(itemCost)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Monthly Free Cash</p>
              <p className="font-bold text-brand-600 mt-0.5">{formatRupee(monthlySurplus)}</p>
            </div>
          </div>

          {monthsToSave > 0 && (
            <p className="text-[11px] text-muted leading-relaxed">
              At your current monthly savings rate, you can buy this comfortably in{' '}
              <strong className="text-ink font-semibold">{monthsToSave} months</strong> without taking costly debt.
            </p>
          )}

          <div className="flex justify-end pt-1">
            <Link
              to="/goals"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-white px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs hover:shadow-xs transition-all"
            >
              Set as a Goal <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    case 'health_score': {
      const { score = 0, band = 'Fair', message } = data;
      const badgeColor =
        score >= 80 ? 'text-good bg-good/10' : score >= 60 ? 'text-brand-600 bg-brand-50' : 'text-warn bg-warn/10';

      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <HeartPulse className="w-3.5 h-3.5 text-brand-500" />
              Your Health Score
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {band}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-brand-100/60 flex items-center justify-between">
            <div>
              <p className="text-2xl font-heading font-black text-ink">
                {score}
                <span className="text-xs text-muted font-normal"> / 100</span>
              </p>
              <p className="text-[11px] text-muted mt-0.5">Scored across savings, debt & budget</p>
            </div>
            <Link
              to="/health-score"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100 shadow-2xs hover:shadow-xs transition-all"
            >
              Score Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    case 'goals': {
      const { goals = [] } = data;
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              Your Savings Goals ({goals.length})
            </span>
            <Link
              to="/goals"
              onClick={onActionClick}
              className="text-[11px] text-brand-600 hover:underline font-semibold"
            >
              View all
            </Link>
          </div>

          {goals.length === 0 ? (
            <p className="text-muted text-[11px]">You have no active goals yet. Setting one is a great first step!</p>
          ) : (
            <div className="space-y-2">
              {goals.slice(0, 3).map((g, idx) => {
                const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
                return (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-brand-100/60">
                    <div className="flex justify-between text-[11px] font-medium text-ink mb-1">
                      <span>{g.name}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-brand-50 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    case 'expenses': {
      const { topCategories = [], totalSpent = 0 } = data;
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <Receipt className="w-3.5 h-3.5 text-brand-500" />
              Recent Spending Summary
            </span>
            <span className="font-bold text-ink text-xs">{formatRupee(totalSpent)}</span>
          </div>

          {topCategories.length > 0 && (
            <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-brand-100/60">
              {topCategories.slice(0, 3).map((cat, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="text-muted capitalize">{cat.category || 'Other'}</span>
                  <span className="font-semibold text-ink">{formatRupee(cat.total)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Link
              to="/transactions"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-white px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs hover:shadow-xs transition-all"
            >
              See All Expenses <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
