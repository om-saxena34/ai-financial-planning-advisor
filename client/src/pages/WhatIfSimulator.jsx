import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { healthScoreService } from '../services/healthScore.service';
import { transactionService } from '../services/transaction.service';
import { predictionService } from '../services/prediction.service';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Zap,
  CheckCircle2,
  DollarSign,
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

    // Approximate health score impact:
    // +20 points max for savings rate boost, +10 points for expense cut
    const savingsRateScore = Math.min(25, Math.round((newSavingsRate / 0.3) * 25));
    const expenseScore = Math.min(20, Math.round(((1 - newExpenses / newIncome) / 0.5) * 20));
    const basePillarsScore = 40; // baseline contribution from other factors
    const newScore = Math.min(100, Math.max(20, basePillarsScore + savingsRateScore + expenseScore));

    // Dynamic Persona Shift
    let newPersona = 'Balanced';
    if (newSavingsRate >= 0.35 && (newExpenses / newIncome) < 0.6) {
      newPersona = 'Saver';
    } else if (newSavingsRate < 0.12 || (newExpenses / newIncome) > 0.85) {
      newPersona = 'Overspender';
    }

    // 5-Year Wealth Math:
    // Future value of existing investments compounded at returnRate
    const r_annual = returnRate / 100;
    const existingGrowth = baseData.existingInvestments * Math.pow(1 + r_annual, 5);

    // SIP compounding of (base monthly savings + sipBoost)
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

    // Baseline 5y wealth without changes
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Scenario Planning
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            What-If Financial Simulator
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Simulate the multi-year compound impact of salary bumps, spending discipline, and SIP boosts.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Sliders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Sliders Panel (1 Col) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Decision Controls
          </h2>

          {/* Slider 1: Income Delta */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Monthly Income Boost
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>+₹0</span>
              <span>+₹25,000</span>
              <span>+₹50,000</span>
            </div>
          </div>

          {/* Slider 2: Discretionary Cut */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Trim Discretionary Expenses
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0% (As-is)</span>
              <span>25% cut</span>
              <span>50% max</span>
            </div>
          </div>

          {/* Slider 3: SIP Boost */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Boost Monthly SIP
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>+₹0</span>
              <span>+₹12,000</span>
              <span>+₹25,000</span>
            </div>
          </div>

          {/* Slider 4: Return Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Annual Portfolio Return
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {returnRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="16"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>8% (Conservative)</span>
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
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">
                Financial Health Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {simResults.simScore}
                </span>
                <span className="text-xs text-gray-400">/ 100</span>
                <span className="text-xs font-bold text-emerald-600 ml-auto">
                  +{simResults.simScore - baseData.baseScore} pts
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Baseline was {baseData.baseScore}
              </div>
            </div>

            {/* Persona Shift */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">
                AI Behavior Class
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {simResults.simPersona}
              </div>
              <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Target cluster achieved
              </div>
            </div>

            {/* 5-Year Wealth Gain */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">
                5-Year Wealth Creation
              </span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                ₹{(simResults.sim5yWealth / 100000).toFixed(1)}L
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">
                +₹{(simResults.delta5yWealth / 100000).toFixed(1)}L extra wealth!
              </div>
            </div>
          </div>

          {/* 5-Year Comparison Area Chart */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  5-Year Compounding Trajectory
                </h3>
                <p className="text-xs text-gray-500">
                  Simulated Strategy vs Baseline Status-Quo
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Simulated
                </span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData}>
                  <defs>
                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline"
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="simulated"
                    name="Simulated"
                    stroke="#4f46e5"
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
