import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function WhatIfSimulator() {
  const [baseData, setBaseData] = useState({
    monthlyIncome: 75000,
    totalExpenses: 48000,
    discretionaryExpenses: 18000,
    existingSavings: 120000,
    existingInvestments: 180000,
    monthlySip: 5000,
    baseScore: 68,
  });

  // Simulator Sliders State
  const [incomeDelta, setIncomeDelta] = useState(0); // +/- in INR
  const [expenseCutPct, setExpenseCutPct] = useState(0); // 0% to 50%
  const [sipBoost, setSipBoost] = useState(0); // + in INR
  const [returnRate, setReturnRate] = useState(11); // 8% to 16%

  // Simulation Results
  const [simResults, setSimResults] = useState({
    simScore: 68,
    simPersona: 'Balanced',
    sim5yWealth: 0,
    delta5yWealth: 0,
  });

  // Calculate live projections whenever sliders move
  useEffect(() => {
    const newIncome = Math.max(10000, baseData.monthlyIncome + Number(incomeDelta));
    const cutAmount = baseData.discretionaryExpenses * (Number(expenseCutPct) / 100);
    const newExpenses = Math.max(1000, baseData.totalExpenses - cutAmount);
    const newSavings = Math.max(0, newIncome - newExpenses);
    const newSavingsRate = newSavings / newIncome;

    const savingsRateScore = Math.min(25, Math.round((newSavingsRate / 0.3) * 25));
    const expenseScore = Math.min(20, Math.round(((1 - newExpenses / newIncome) / 0.5) * 20));
    const basePillarsScore = 40;
    const newScore = Math.min(100, Math.max(20, basePillarsScore + savingsRateScore + expenseScore));

    // Dynamic Persona Shift
    let newPersona = 'Balanced';
    if (newSavingsRate >= 0.35 && (newExpenses / newIncome) < 0.6) {
      newPersona = 'Saver';
    } else if (newSavingsRate < 0.12 || (newExpenses / newIncome) > 0.85) {
      newPersona = 'Overspender';
    }

    // 5-Year Wealth Math:
    const r_annual = returnRate / 100;
    const existingGrowth = baseData.existingInvestments * Math.pow(1 + r_annual, 5);

    const totalMonthlyInvestment = Math.max(0, baseData.monthlySip + Number(sipBoost) + cutAmount * 0.5);
    const r_monthly = r_annual / 12;
    const n_months = 60;
    const sipFv =
      totalMonthlyInvestment > 0
        ? totalMonthlyInvestment *
          ((Math.pow(1 + r_monthly, n_months) - 1) / r_monthly) *
          (1 + r_monthly)
        : 0;

    const sim5y = Math.round(baseData.existingSavings + existingGrowth + sipFv);

    const baseSipFv =
      baseData.monthlySip *
      ((Math.pow(1 + 0.1 / 12, 60) - 1) / (0.1 / 12)) *
      (1 + 0.1 / 12);
    const base5y = Math.round(
      baseData.existingSavings +
        baseData.existingInvestments * Math.pow(1.1, 5) +
        baseSipFv
    );

    setSimResults({
      simScore: newScore,
      simPersona: newPersona,
      sim5yWealth: sim5y,
      delta5yWealth: Math.max(0, sim5y - base5y),
    });
  }, [incomeDelta, expenseCutPct, sipBoost, returnRate, baseData]);

  const handleReset = () => {
    setIncomeDelta(0);
    setExpenseCutPct(0);
    setSipBoost(0);
    setReturnRate(11);
  };

  // Trajectory projection chart
  const trajectoryData = [1, 2, 3, 4, 5].map((year) => {
    const r = returnRate / 100;
    const months = year * 12;
    const monthlyInv = baseData.monthlySip + Number(sipBoost) + (baseData.discretionaryExpenses * (expenseCutPct / 100)) * 0.5;
    const r_m = r / 12;
    const sipVal =
      monthlyInv > 0
        ? monthlyInv * ((Math.pow(1 + r_m, months) - 1) / r_m) * (1 + r_m)
        : 0;
    const baseSipVal =
      baseData.monthlySip * ((Math.pow(1 + 0.1 / 12, months) - 1) / (0.1 / 12)) * (1 + 0.1 / 12);

    return {
      year: `Year ${year}`,
      baseline: Math.round(baseData.existingInvestments * Math.pow(1.1, year) + baseSipVal),
      simulated: Math.round(baseData.existingInvestments * Math.pow(1 + r, year) + sipVal),
    };
  });

  return (
    <PageWrapper title="What-If Financial Simulator">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--blue-50)] text-[var(--blue-700)] text-xs font-semibold rounded-full mb-2 border border-[var(--blue-100)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--blue-500)]" />
            Interactive Scenario Planning
          </div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">
            What-If Financial Simulator
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            See how small changes today shape your wealth and savings score over the next 5 years.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[var(--blue-100)] text-[var(--ink)] hover:bg-[var(--blue-50)] text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--blue-500)]" />
          Reset Sliders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Sliders Panel (1 Col) */}
        <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 shadow-xs space-y-6 relative overflow-hidden">
          <CornerDecor variant="dots" position="top-right" size={50} opacity={0.3} />
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--blue-500)]" />
            Decision Controls
          </h2>

          {/* Slider 1: Income Delta */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                Monthly Income Boost
                <HelpTooltip term="Salary Bump" text="Simulate getting a promotion or new job that pays more each month." />
              </span>
              <span className="font-bold text-[var(--good)]">
                +₹{Number(incomeDelta).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="2000"
              value={incomeDelta}
              onChange={(e) => setIncomeDelta(e.target.value)}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>+₹0</span>
              <span>+₹25,000</span>
              <span>+₹50,000</span>
            </div>
          </div>

          {/* Slider 2: Discretionary Cut */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                Trim Discretionary Expenses
                <HelpTooltip term="Cut spending" text="Eating out less, fewer impulse online orders, and cheaper entertainment." />
              </span>
              <span className="font-bold text-[var(--blue-700)]">
                {expenseCutPct}% cut
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={expenseCutPct}
              onChange={(e) => setExpenseCutPct(e.target.value)}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>0% (As-is)</span>
              <span>25% cut</span>
              <span>50% max</span>
            </div>
          </div>

          {/* Slider 3: SIP Boost */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                Boost Monthly SIP
                <HelpTooltip term="Extra SIP" text="Putting an extra amount each month directly into investments." />
              </span>
              <span className="font-bold text-[var(--blue-700)]">
                +₹{Number(sipBoost).toLocaleString('en-IN')}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25000"
              step="1000"
              value={sipBoost}
              onChange={(e) => setSipBoost(e.target.value)}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>+₹0</span>
              <span>+₹12,000</span>
              <span>+₹25,000</span>
            </div>
          </div>

          {/* Slider 4: Return Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[var(--ink)]">
                Expected Yearly Return
              </span>
              <span className="font-bold text-[var(--blue-700)]">
                {returnRate}% per year
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="16"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(e.target.value)}
              className="w-full accent-[#5B9FD6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>8% (Safe)</span>
              <span>12% (Index)</span>
              <span>16% (Aggressive)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Results (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Impact KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Health Score Impact */}
            <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <CornerDecor variant="dots" position="top-right" size={40} opacity={0.25} />
              <span className="text-xs text-[var(--muted)] uppercase font-semibold block mb-1">
                Predicted Health Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[var(--blue-700)]">
                  <AnimatedNumber value={simResults.simScore} />
                </span>
                <span className="text-xs text-[var(--muted)]">/ 100</span>
                <span className="text-xs font-bold text-[var(--good)] ml-auto">
                  +{simResults.simScore - baseData.baseScore} pts
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1">
                Your current score is {baseData.baseScore}
              </div>
            </div>

            {/* Persona Shift */}
            <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <CornerDecor variant="arc" position="top-right" size={40} opacity={0.25} />
              <span className="text-xs text-[var(--muted)] uppercase font-semibold block mb-1">
                Spending Style
              </span>
              <div className="text-2xl font-extrabold text-[var(--good)]">
                {simResults.simPersona}
              </div>
              <div className="text-[11px] text-[var(--good)] mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Healthy habits unlocked
              </div>
            </div>

            {/* 5-Year Wealth Gain */}
            <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <CornerDecor variant="blob" position="top-right" size={45} opacity={0.3} />
              <span className="text-xs text-[var(--muted)] uppercase font-semibold block mb-1">
                5-Year Wealth Creation
              </span>
              <div className="text-2xl font-extrabold text-[var(--ink)]">
                ₹{(simResults.sim5yWealth / 100000).toFixed(1)}L
              </div>
              <div className="text-[11px] text-[var(--good)] font-bold mt-1">
                +₹{(simResults.delta5yWealth / 100000).toFixed(1)}L extra saved!
              </div>
            </div>
          </div>

          {/* 5-Year Comparison Area Chart */}
          <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <CornerDecor variant="wave" position="top-right" size={60} opacity={0.3} />
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)]">
                  5-Year Savings Trajectory
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Your New Scenario vs Staying on Current Path
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[var(--muted)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--blue-300)]" /> Current path
                </span>
                <span className="flex items-center gap-1.5 text-[var(--blue-700)] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--blue-500)]" /> New scenario
                </span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData}>
                  <defs>
                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B9FD6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#5B9FD6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCEBF8" opacity={0.7} />
                  <XAxis dataKey="year" stroke="#6B7F92" fontSize={11} />
                  <YAxis
                    stroke="#6B7F92"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '0.75rem',
                      border: '1px solid #DCEBF8',
                      color: '#1E3246',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(30, 50, 70, 0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    name="Current path"
                    stroke="#A9CFEE"
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="simulated"
                    name="New scenario"
                    stroke="#5B9FD6"
                    strokeWidth={2.5}
                    fill="url(#colorSim)"
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
