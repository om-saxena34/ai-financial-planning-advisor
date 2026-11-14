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
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { formatCurrency, formatCompactNumber } from '../utils/formatters';

export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [annualRate, setAnnualRate] = useState(9);
  const [years, setYears] = useState(5);
  const [frequency, setFrequency] = useState(12); // monthly

  const calculation = useMemo(() => {
    const P = Number(principal);
    const r = Number(annualRate) / 100;
    const t = Number(years);
    const n = Number(frequency);

    if (P <= 0 || t <= 0) {
      return { futureValue: 0, interestEarned: 0, schedule: [] };
    }

    const futureValue = P * Math.pow(1 + r / n, n * t);
    const interestEarned = futureValue - P;

    const schedule = [];
    for (let y = 1; y <= t; y++) {
      const fvY = P * Math.pow(1 + r / n, n * y);
      schedule.push({
        year: `Yr ${y}`,
        principal: P,
        interest: Math.round(fvY - P),
        total: Math.round(fvY),
      });
    }

    return {
      futureValue: Math.round(futureValue),
      interestEarned: Math.round(interestEarned),
      schedule,
    };
  }, [principal, annualRate, years, frequency]);

  return (
    <PageWrapper
      title="Compound Interest Calculator"
      subtitle="Calculate exponential wealth accumulation on lump-sum deposits with varying compounding intervals."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Deposit Settings</span>
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
              A = P(1 + r/n)^nt
            </span>
          </div>

          {/* Principal Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Initial Principal Deposit
              </label>
              <div className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                ₹{Number(principal).toLocaleString('en-IN')}
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="10000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹10,000</span>
              <span>₹10,00,000</span>
              <span>₹20,00,000</span>
            </div>
          </div>

          {/* Annual Return Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Annual Interest Rate (%)
              </label>
              <div className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                {annualRate}%
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="0.5"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Years Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Time Horizon (Years)
              </label>
              <div className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                {years} Years
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Compounding Frequency Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Compounding Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Annually (1x)', value: 1 },
                { label: 'Semi-Annual (2x)', value: 2 },
                { label: 'Quarterly (4x)', value: 4 },
                { label: 'Monthly (12x)', value: 12 },
              ].map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFrequency(freq.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    frequency === freq.value
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 block mb-1">Principal Deposited</span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(principal)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 block mb-1">Total Interest Earned</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(calculation.interestEarned)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 block mb-1">Total Maturity Value</span>
              <span className="text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(calculation.futureValue)}
              </span>
            </div>
          </div>

          {/* Area Chart: Growth Curve */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Exponential Compounding Growth</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculation.schedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
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
                    name="Total Value"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompTotal)"
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
