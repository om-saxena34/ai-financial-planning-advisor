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
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
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
      subtitle="See how a single lump-sum deposit grows faster and faster over time."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white border border-[var(--blue-100)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
          <CornerDecor variant="dots" position="top-right" size={50} opacity={0.3} />

          <div className="flex items-center justify-between pb-3 border-b border-[var(--blue-100)]">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[var(--blue-500)]" />
              <span>Deposit Settings</span>
            </h3>
            <span className="text-[11px] font-semibold text-[var(--blue-700)] bg-[var(--blue-50)] px-2.5 py-0.5 rounded-full border border-[var(--blue-100)] flex items-center gap-1">
              Compound Formula
              <HelpTooltip term="Formula" text="A = P × (1 + r/n)^(nt). Interest earns its own interest over time." />
            </span>
          </div>

          {/* Principal Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1">
                Starting Money (Principal)
                <HelpTooltip term="Principal" text="The lump sum amount you deposit at the beginning." />
              </label>
              <div className="inline-flex items-center text-sm font-bold text-[var(--blue-700)] bg-[var(--blue-50)] border border-[var(--blue-100)] px-2.5 py-1 rounded-lg">
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
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>₹10,000</span>
              <span>₹10,00,000</span>
              <span>₹20,00,000</span>
            </div>
          </div>

          {/* Annual Return Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1">
                Annual Interest Rate (%)
                <HelpTooltip term="Rate" text="Yearly interest rate provided by your bank deposit or fund." />
              </label>
              <div className="inline-flex items-center text-sm font-bold text-[var(--blue-700)] bg-[var(--blue-50)] border border-[var(--blue-100)] px-2.5 py-1 rounded-lg">
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
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>1%</span>
              <span>12%</span>
              <span>25%</span>
            </div>
          </div>

          {/* Years Slider */}
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
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Compounding Frequency Selection */}
          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-2 flex items-center gap-1">
              How often interest is added:
              <HelpTooltip term="Frequency" text="More frequent compounding means slightly faster growth." />
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Yearly (1x)', value: 1 },
                { label: 'Half-yearly (2x)', value: 2 },
                { label: 'Quarterly (4x)', value: 4 },
                { label: 'Monthly (12x)', value: 12 },
              ].map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFrequency(freq.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    frequency === freq.value
                      ? 'border-[var(--blue-500)] bg-[var(--blue-50)] text-[var(--blue-700)] shadow-xs'
                      : 'border-[var(--blue-100)] text-[var(--muted)] hover:bg-[var(--blue-50)]'
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
            <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
              <CornerDecor variant="dots" position="top-right" size={40} opacity={0.25} />
              <span className="text-xs text-[var(--muted)] block mb-1">Starting Money</span>
              <span className="text-lg sm:text-xl font-bold text-[var(--ink)]">
                <AnimatedNumber value={principal} prefix="₹" />
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
              <CornerDecor variant="arc" position="top-right" size={40} opacity={0.25} />
              <span className="text-xs text-[var(--muted)] block mb-1">Interest Earned</span>
              <span className="text-lg sm:text-xl font-bold text-[var(--good)]">
                +<AnimatedNumber value={calculation.interestEarned} prefix="₹" />
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
              <CornerDecor variant="blob" position="top-right" size={45} opacity={0.3} />
              <span className="text-xs text-[var(--muted)] block mb-1">Total Maturity Value</span>
              <span className="text-lg sm:text-xl font-extrabold text-[var(--blue-700)]">
                <AnimatedNumber value={calculation.futureValue} prefix="₹" />
              </span>
            </div>
          </div>

          {/* Area Chart: Growth Curve */}
          <div className="p-6 rounded-3xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
            <CornerDecor variant="wave" position="top-right" size={60} opacity={0.3} />
            <h4 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[var(--blue-500)]" />
              <span>Your Money Growing Over Time</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculation.schedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B9FD6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5B9FD6" stopOpacity={0.0} />
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
                    name="Total Value"
                    stroke="#5B9FD6"
                    strokeWidth={2.5}
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
