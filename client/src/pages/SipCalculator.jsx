import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Calculator,
  TrendingUp,
  Sparkles,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
import { formatCurrency, formatCompactNumber } from '../utils/formatters';

export default function SipCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(10);
  const [isStepUp, setIsStepUp] = useState(false);
  const [stepUpPercent, setStepUpPercent] = useState(10);
  const [adjustInflation, setAdjustInflation] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  // Real-time calculation
  const calculation = useMemo(() => {
    const P = Number(monthlyAmount);
    const r = Number(annualRate);
    const Y = Number(years);

    if (P <= 0 || Y <= 0) {
      return { totalInvested: 0, futureValue: 0, wealthGain: 0, schedule: [] };
    }

    const schedule = [];

    if (!isStepUp) {
      const i = r / 12 / 100;
      const n = Y * 12;
      const totalInvested = P * n;
      let fv = 0;

      if (i === 0) {
        fv = totalInvested;
      } else {
        fv = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
      }

      for (let y = 1; y <= Y; y++) {
        const months = y * 12;
        const inv = P * months;
        const fvY = i === 0 ? inv : P * (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
        schedule.push({
          year: `Yr ${y}`,
          invested: Math.round(inv),
          interest: Math.round(Math.max(0, fvY - inv)),
          total: Math.round(fvY),
        });
      }

      let realFv = fv;
      if (adjustInflation) {
        realFv = fv / Math.pow(1 + Number(inflationRate) / 100, Y);
      }

      return {
        totalInvested: Math.round(totalInvested),
        futureValue: Math.round(fv),
        wealthGain: Math.round(Math.max(0, fv - totalInvested)),
        realFv: Math.round(realFv),
        schedule,
      };
    } else {
      // Step-Up SIP
      const i = r / 12 / 100;
      let runningInvested = 0;
      let currentSip = P;
      let runningCurve = 0;

      for (let y = 1; y <= Y; y++) {
        for (let m = 1; m <= 12; m++) {
          runningCurve = (runningCurve + currentSip) * (1 + i);
        }
        runningInvested += currentSip * 12;
        schedule.push({
          year: `Yr ${y}`,
          invested: Math.round(runningInvested),
          interest: Math.round(Math.max(0, runningCurve - runningInvested)),
          total: Math.round(runningCurve),
        });
        currentSip = currentSip * (1 + Number(stepUpPercent) / 100);
      }

      let realFv = runningCurve;
      if (adjustInflation) {
        realFv = runningCurve / Math.pow(1 + Number(inflationRate) / 100, Y);
      }

      return {
        totalInvested: Math.round(runningInvested),
        futureValue: Math.round(runningCurve),
        wealthGain: Math.round(Math.max(0, runningCurve - runningInvested)),
        realFv: Math.round(realFv),
        schedule,
      };
    }
  }, [monthlyAmount, annualRate, years, isStepUp, stepUpPercent, adjustInflation, inflationRate]);

  return (
    <PageWrapper
      title="SIP Calculator"
      subtitle="See how small monthly savings grow into a big fund over time with compound interest."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white border border-[var(--blue-100)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
          <CornerDecor variant="dots" position="top-right" size={50} opacity={0.3} />

          <div className="flex items-center justify-between pb-3 border-b border-[var(--blue-100)]">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[var(--blue-500)]" />
              <span>Choose Your Amounts</span>
            </h3>
            <span className="text-[11px] font-semibold text-[var(--blue-700)] bg-[var(--blue-50)] px-2.5 py-0.5 rounded-full border border-[var(--blue-100)] flex items-center gap-1">
              Exact Math
              <HelpTooltip term="Math model" text="Uses standard monthly compound interest (annuity due) formula." />
            </span>
          </div>

          {/* Monthly Investment Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1">
                Monthly Savings
                <HelpTooltip term="SIP" text="The amount you invest each month." />
              </label>
              <div className="inline-flex items-center text-sm font-bold text-[var(--blue-700)] bg-[var(--blue-50)] border border-[var(--blue-100)] px-2.5 py-1 rounded-lg">
                ₹{Number(monthlyAmount).toLocaleString('en-IN')}
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Expected Return Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1">
                Expected Annual Return (%)
                <HelpTooltip term="Return" text="Expected growth rate per year. Mutual funds in India historically average 11-13%." />
              </label>
              <div className="inline-flex items-center text-sm font-bold text-[var(--blue-700)] bg-[var(--blue-50)] border border-[var(--blue-100)] px-2.5 py-1 rounded-lg">
                {annualRate}%
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>6% (Fixed Deposit)</span>
              <span>12% (Index Funds)</span>
              <span>20% (Aggressive)</span>
            </div>
          </div>

          {/* Time Horizon Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)]">
                Time Period (Years)
              </label>
              <div className="inline-flex items-center text-sm font-bold text-[var(--blue-700)] bg-[var(--blue-50)] border border-[var(--blue-100)] px-2.5 py-1 rounded-lg">
                {years} Years
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>35 Years</span>
            </div>
          </div>

          {/* Step-Up SIP Toggle */}
          <div className="pt-3 border-t border-[var(--blue-100)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--ink)] block flex items-center gap-1">
                  Annual Step-Up SIP
                  <HelpTooltip term="Step-up" text="Increase your contribution each year as your salary increases." />
                </span>
                <span className="text-[11px] text-[var(--muted)] block">
                  Add a little more every year as you earn more
                </span>
              </div>
              <input
                type="checkbox"
                checked={isStepUp}
                onChange={(e) => setIsStepUp(e.target.checked)}
                className="w-4 h-4 accent-[#5B9FD6] rounded cursor-pointer"
              />
            </div>

            {isStepUp && (
              <div className="mt-3 p-3 bg-[var(--blue-50)] rounded-xl space-y-2 border border-[var(--blue-100)]">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--muted)]">Increase by each year:</span>
                  <span className="font-bold text-[var(--blue-700)]">{stepUpPercent}% per year</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={stepUpPercent}
                  onChange={(e) => setStepUpPercent(Number(e.target.value))}
                  className="w-full accent-[#5B9FD6] cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Inflation Adjustment Toggle */}
          <div className="pt-3 border-t border-[var(--blue-100)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--ink)] block flex items-center gap-1">
                  Account for Inflation
                  <HelpTooltip term="Inflation" text="See what this future money can actually buy in today's rupee value (assumes 6% inflation)." />
                </span>
                <span className="text-[11px] text-[var(--muted)] block">
                  Show real value in today's purchasing power
                </span>
              </div>
              <input
                type="checkbox"
                checked={adjustInflation}
                onChange={(e) => setAdjustInflation(e.target.checked)}
                className="w-4 h-4 accent-[#5B9FD6] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results & Visuals Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
              <CornerDecor variant="dots" position="top-right" size={40} opacity={0.25} />
              <span className="text-xs text-[var(--muted)] block mb-1">Total Invested</span>
              <span className="text-lg sm:text-xl font-bold text-[var(--blue-700)]">
                <AnimatedNumber value={calculation.totalInvested} prefix="₹" />
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
              <CornerDecor variant="arc" position="top-right" size={40} opacity={0.25} />
              <span className="text-xs text-[var(--muted)] block mb-1">Gains Earned</span>
              <span className="text-lg sm:text-xl font-bold text-[var(--good)]">
                +<AnimatedNumber value={calculation.wealthGain} prefix="₹" />
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
              <CornerDecor variant="blob" position="top-right" size={45} opacity={0.3} />
              <span className="text-xs text-[var(--muted)] block mb-1">
                {adjustInflation ? 'Paper Value' : 'Total Future Value'}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-[var(--ink)]">
                <AnimatedNumber value={calculation.futureValue} prefix="₹" />
              </span>
            </div>
          </div>

          {adjustInflation && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Real Value (what this money buys today at 6% inflation):</span>
              </div>
              <span className="font-extrabold text-sm">{formatCurrency(calculation.realFv)}</span>
            </div>
          )}

          {/* Area Chart: Wealth Trajectory */}
          <div className="p-6 rounded-3xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
            <CornerDecor variant="wave" position="top-right" size={60} opacity={0.3} />
            <h4 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[var(--blue-500)]" />
              <span>How Your Money Grows Over {years} Years</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculation.schedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B9FD6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5B9FD6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A9CFEE" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#A9CFEE" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCEBF8" opacity={0.6} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7F92' }} />
                  <YAxis
                    tickFormatter={(val) => formatCompactNumber(val)}
                    tick={{ fontSize: 11, fill: '#6B7F92' }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value)]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #DCEBF8',
                      fontSize: 12,
                      boxShadow: '0 4px 12px rgba(30, 50, 70, 0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Future Value"
                    stroke="#5B9FD6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name="Amount Invested"
                    stroke="#A9CFEE"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
