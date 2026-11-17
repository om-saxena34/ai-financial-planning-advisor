import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Target,
  HeartPulse,
  Receipt,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

function formatRupee(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export default function ChatCards({ card, onActionClick }) {
  if (!card || !card.type) return null;
  const data = card.data || card;

  switch (card.type) {
    // ── SIP Calculation Card ──
    case 'sip_calculation':
    case 'sip_result': {
      const monthlyAmount = data.monthlyAmount || data.monthlyInvestment || 0;
      const annualRate = data.annualRate || 12;
      const years = data.years || 5;
      const totalInvested = data.totalInvested || monthlyAmount * 12 * years;
      const futureValue = data.futureValue || data.estimatedWealth || 0;
      const wealthGain = data.wealthGain || Math.max(0, futureValue - totalInvested);

      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <Calculator className="w-3.5 h-3.5 text-brand-500" />
              SIP Math Breakdown
            </span>
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full">
              {years} Years @ {annualRate}% p.a.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-surface p-2.5 rounded-xl border border-brand-100/60 text-center">
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
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-surface px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs hover:shadow-xs transition-all"
            >
              Full Calculator <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    // ── Compound Interest Card ──
    case 'compound_result': {
      const { principal = 0, annualRate = 10, years = 5, futureValue = 0, interestEarned = 0 } = data;
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
              Lump-Sum Compound Growth
            </span>
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full">
              {years} Years @ {annualRate}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-surface p-2.5 rounded-xl border border-brand-100/60">
            <div>
              <p className="text-[10px] text-muted">Initial Lump-Sum</p>
              <p className="font-bold text-ink mt-0.5">{formatRupee(principal)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Interest Earned</p>
              <p className="font-bold text-good mt-0.5">+{formatRupee(interestEarned)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-brand-500/10 p-2.5 rounded-xl border border-brand-500/20">
            <div>
              <p className="text-[10px] text-brand-700 font-medium">Estimated Future Total</p>
              <p className="text-sm font-heading font-extrabold text-brand-700">{formatRupee(futureValue)}</p>
            </div>
          </div>
        </div>
      );
    }

    // ── Target / Required SIP Card ──
    case 'required_sip_result': {
      const { targetAmount = 0, years = 5, expectedRate = 12, requiredMonthlySip = 0 } = data;
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              Target Goal Planner
            </span>
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full">
              Target: {formatRupee(targetAmount)}
            </span>
          </div>

          <div className="bg-surface p-3 rounded-xl border border-brand-100/60 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted">Required Monthly SIP</p>
              <p className="text-xl font-heading font-extrabold text-brand-700 mt-0.5">
                {formatRupee(requiredMonthlySip)}
                <span className="text-xs text-muted font-normal"> / month</span>
              </p>
              <p className="text-[10px] text-muted mt-0.5">Assuming {expectedRate}% return over {years} years</p>
            </div>
            <Link
              to="/goals"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200 transition-all shadow-2xs"
            >
              Save Goal <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    // ── Affordability Card ──
    case 'affordability': {
      const { itemCost, monthlySurplus, monthsToSave, isAffordable } = data;
      const isOk = isAffordable;
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              {isOk ? <CheckCircle2 className="w-3.5 h-3.5 text-good" /> : <AlertCircle className="w-3.5 h-3.5 text-warn" />}
              Affordability Assessment
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOk ? 'bg-good/10 text-good' : 'bg-warn/10 text-warn'}`}>
              {isOk ? 'Within Budget' : 'Planning Needed'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-surface p-2.5 rounded-xl border border-brand-100/60">
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
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-surface px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs hover:shadow-xs transition-all"
            >
              Set as a Goal <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    // ── Health Score Card ──
    case 'health_score':
    case 'health_score_result': {
      const score = data.score || 0;
      const band = data.band || data.grade || 'Good';
      const badgeColor =
        score >= 80 ? 'text-good bg-good/10' : score >= 60 ? 'text-brand-600 bg-brand-50' : 'text-warn bg-warn/10';

      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <HeartPulse className="w-3.5 h-3.5 text-brand-500" />
              Financial Health Score
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {band}
            </span>
          </div>

          <div className="bg-surface p-3 rounded-xl border border-brand-100/60 flex items-center justify-between">
            <div>
              <p className="text-2xl font-heading font-black text-ink">
                {score}
                <span className="text-xs text-muted font-normal"> / 100</span>
              </p>
              <p className="text-[11px] text-muted mt-0.5">Scored across savings, bills & safety net</p>
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

    // ── Goals List Card ──
    case 'goals':
    case 'goal_list': {
      const goals = data.goals || [];
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              Active Goals ({goals.length})
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
                const target = g.targetAmount || 1;
                const current = g.currentAmount || 0;
                const pct = g.progressPercent || Math.min(100, Math.round((current / target) * 100));
                return (
                  <div key={idx} className="bg-surface p-2 rounded-xl border border-brand-100/60">
                    <div className="flex justify-between text-[11px] font-medium text-ink mb-1">
                      <span>{g.title || g.name}</span>
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

    // ── Student Plan Card ──
    case 'student_plan_result':
    case 'first_salary_result':
    case 'semester_fee_result': {
      const isSalary = card.type === 'first_salary_result' || data.mode === 'first_salary' || Boolean(data.needs);
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <GraduationCap className="w-3.5 h-3.5 text-brand-500" />
              {isSalary ? 'First-Salary Plan (50/30/20)' : 'Semester Fee Plan'}
            </span>
          </div>

          {isSalary ? (
            <div className="grid grid-cols-3 gap-2 bg-surface p-2.5 rounded-xl border border-brand-100/60 text-center">
              <div>
                <p className="text-[10px] text-muted">Needs (50%)</p>
                <p className="font-bold text-ink mt-0.5">{formatRupee(data.needs)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted">Wants (30%)</p>
                <p className="font-bold text-ink mt-0.5">{formatRupee(data.wants)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted">Savings (20%)</p>
                <p className="font-bold text-good mt-0.5">{formatRupee(data.savings)}</p>
              </div>
            </div>
          ) : (
            <div className="bg-surface p-2.5 rounded-xl border border-brand-100/60 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Total Fee:</span>
                <span className="font-bold text-ink">{formatRupee(data.feeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Save Monthly:</span>
                <span className="font-bold text-brand-600">{formatRupee(data.monthlyNeeded || data.monthlyAmountNeeded)} / mo</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Link
              to="/student-planner"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-surface px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs hover:shadow-xs transition-all"
            >
              Open Student Planner <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      );
    }

    // ── Spending Summary Card ──
    case 'expenses':
    case 'spending_summary': {
      const income = data.monthlyIncome || 0;
      const expenses = data.monthlyExpenses || data.totalSpent || 0;
      const surplus = data.monthlySurplus || Math.max(0, income - expenses);
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 shadow-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink flex items-center gap-1.5 text-xs">
              <Receipt className="w-3.5 h-3.5 text-brand-500" />
              Cash Flow Summary
            </span>
            {data.savingsRatePercent !== undefined && (
              <span className="text-[11px] font-bold text-good bg-good/10 px-2 py-0.5 rounded-full">
                {data.savingsRatePercent}% Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 bg-surface p-2.5 rounded-xl border border-brand-100/60 text-center">
            <div>
              <p className="text-[10px] text-muted">Inflow</p>
              <p className="font-bold text-ink mt-0.5">{formatRupee(income)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Outflow</p>
              <p className="font-bold text-ink mt-0.5">{formatRupee(expenses)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Surplus</p>
              <p className="font-bold text-good mt-0.5">{formatRupee(surplus)}</p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link
              to="/transactions"
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-surface px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs hover:shadow-xs transition-all"
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
