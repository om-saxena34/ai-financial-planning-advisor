import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Calculator,
  TrendingUp,
  Sparkles,
  PieChart as PieIcon,
  Table,
  CheckCircle2,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
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

  const pieData = [
    { name: 'Amount Invested', value: calculation.totalInvested, color: '#4f46e5' },
    { name: 'Wealth Gains', value: calculation.wealthGain, color: '#10b981' },
  ];

  return (
    <PageWrapper
      title="SIP & Wealth Growth Calculator"
      subtitle="Simulate the compounding trajectory of systematic monthly investments with step-up and inflation adjustments."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Investment Parameters</span>
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
              Annuity Due Model
            </span>
          </div>

          {/* Monthly Investment Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Monthly Investment
              </label>
              <div className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Expected Return Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Expected Annual Return Rate (p.a.)
              </label>
              <div className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>1% (FD/Debt)</span>
              <span>12% (Nifty 50)</span>
              <span>30% (Aggressive)</span>
            </div>
          </div>

          {/* Time Horizon Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Investment Horizon
              </label>
              <div className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>1 Yr</span>
              <span>15 Yrs</span>
              <span>35 Yrs</span>
            </div>
          </div>

          {/* Step-Up SIP Toggle */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                  Annual Step-Up SIP
                </span>
                <span className="text-[11px] text-gray-400 block">
                  Increase contribution each year as salary grows
                </span>
              </div>
              <input
                type="checkbox"
                checked={isStepUp}
                onChange={(e) => setIsStepUp(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {isStepUp && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Step-Up Rate:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{stepUpPercent}% per year</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={stepUpPercent}
                  onChange={(e) => setStepUpPercent(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Inflation Adjustment Toggle */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                  Inflation Adjustment
                </span>
                <span className="text-[11px] text-gray-400 block">
                  Show real purchasing power (default: 6% RBI target)
                </span>
              </div>
              <input
                type="checkbox"
                checked={adjustInflation}
                onChange={(e) => setAdjustInflation(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results & Visuals Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 block mb-1">Total Invested</span>
              <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(calculation.totalInvested)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 block mb-1">Estimated Gains</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(calculation.wealthGain)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 block mb-1">
                {adjustInflation ? 'Nominal Value' : 'Total Future Value'}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(calculation.futureValue)}
              </span>
            </div>
          </div>

          {adjustInflation && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Real Value (Purchasing power in today's money at 6% inflation):</span>
              </div>
              <span className="font-extrabold text-sm">{formatCurrency(calculation.realFv)}</span>
            </div>
          )}

          {/* Area Chart: Wealth Trajectory */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Compounding Trajectory Over {years} Years</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculation.schedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(val) => formatCompactNumber(val)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value)]}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Future Value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name="Amount Invested"
                    stroke="#4f46e5"
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
