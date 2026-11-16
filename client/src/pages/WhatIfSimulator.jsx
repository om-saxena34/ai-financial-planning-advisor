import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
import api from '../services/api';
import scenarioService from '../services/scenario.service';
import { calculateHealthScore, sipFutureValue, compoundFV } from '../utils/financialCalc';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  BookmarkPlus,
  Trash2,
  Layers,
  ArrowRight,
  TrendingDown,
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
    monthlyIncome: 65000,
    totalExpenses: 38000,
    discretionaryExpenses: 15000,
    existingSavings: 80000,
    existingInvestments: 120000,
    monthlySip: 5000,
    baseScore: 65,
    occupationType: 'salaried',
  });

  // Simulator Sliders State
  const [incomeDelta, setIncomeDelta] = useState(0); // +/- in INR
  const [expenseCutPct, setExpenseCutPct] = useState(0); // 0% to 50%
  const [sipBoost, setSipBoost] = useState(0); // + in INR
  const [returnRate, setReturnRate] = useState(11); // 8% to 16%

  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [savingScenario, setSavingScenario] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Simulation Results
  const [simResults, setSimResults] = useState({
    simScore: 65,
    simPersona: 'Balanced',
    sim5yWealth: 0,
    delta5yWealth: 0,
    summary: '',
    newIncome: 65000,
    newExpenses: 38000,
    totalSip: 5000,
  });

  // Load real user profile on mount
  useEffect(() => {
    api
      .get('/profile')
      .then((res) => {
        if (res.data?.data?.profile) {
          const p = res.data.data.profile;
          setBaseData({
            monthlyIncome: p.monthlyIncome || 65000,
            totalExpenses: p.fixedExpenses ? p.fixedExpenses * 1.3 : 38000,
            discretionaryExpenses: p.fixedExpenses ? p.fixedExpenses * 0.4 : 15000,
            existingSavings: p.existingSavings || 80000,
            existingInvestments: p.existingInvestments || 120000,
            monthlySip: Math.round((p.monthlyIncome || 65000) * 0.1),
            baseScore: 65,
            occupationType: p.occupationType || 'salaried',
          });
        }
      })
      .catch(() => {});

    loadSavedScenarios();
  }, []);

  const loadSavedScenarios = async () => {
    try {
      const res = await scenarioService.listScenarios();
      if (res.data?.scenarios) {
        setSavedScenarios(res.data.scenarios);
      }
    } catch (_) {}
  };

  // Instant calculation on slider change using shared formulas
  useEffect(() => {
    const newIncome = Math.max(5000, baseData.monthlyIncome + Number(incomeDelta));
    const cutAmount = baseData.discretionaryExpenses * (Number(expenseCutPct) / 100);
    const newExpenses = Math.max(1000, baseData.totalExpenses - cutAmount);
    const newSavings = Math.max(0, newIncome - newExpenses);
    const newSavingsRate = newSavings / newIncome;
    const totalSip = Math.max(0, baseData.monthlySip + Number(sipBoost) + cutAmount * 0.5);

    const scoreResult = calculateHealthScore({
      monthlyIncome: newIncome,
      monthlyExpenses: newExpenses,
      essentialExpenses: newExpenses * 0.65,
      liquidSavings: baseData.existingSavings,
      debtPayments: Math.round(newExpenses * 0.15),
      monthlyInvestments: totalSip,
      goalProgressAvg: 60,
      goalCount: 1,
      emergencyFundTarget: baseData.occupationType === 'student' ? 3 : 6,
    });

    let newPersona = 'Balanced';
    if (newSavingsRate >= 0.35) newPersona = 'Saver';
    else if (newSavingsRate < 0.15) newPersona = 'Overspender';

    // 5-Year Wealth Math
    const existGrowth = compoundFV(baseData.existingInvestments, returnRate, 5);
    const sipFv = sipFutureValue(totalSip, returnRate, 5);
    const sim5yWealth = Math.round(existGrowth + sipFv);

    const baselineExistGrowth = compoundFV(baseData.existingInvestments, returnRate, 5);
    const baselineSipFv = sipFutureValue(baseData.monthlySip, returnRate, 5);
    const baseline5yWealth = Math.round(baselineExistGrowth + baselineSipFv);
    const delta5yWealth = Math.max(0, sim5yWealth - baseline5yWealth);

    // Human-friendly summary
    const scoreDiff = scoreResult.score - baseData.baseScore;
    const scoreText =
      scoreDiff >= 0
        ? `raises your score by +${scoreDiff} points`
        : `lowers your score by ${scoreDiff} points`;

    const summary =
      expenseCutPct > 0 || incomeDelta > 0 || sipBoost > 0
        ? `If you ${
            expenseCutPct > 0 ? `spend ${expenseCutPct}% less on optional wants` : ''
          }${expenseCutPct > 0 && sipBoost > 0 ? ' and ' : ''}${
            sipBoost > 0 ? `invest ₹${Number(sipBoost).toLocaleString('en-IN')} more/mo` : ''
          }, that ${scoreText} and builds ₹${(delta5yWealth / 100000).toFixed(1)} Lakh extra in 5 years.`
        : 'Move any slider below to see instant before-and-after changes to your money and score.';

    setSimResults({
      simScore: scoreResult.score,
      simPersona: newPersona,
      sim5yWealth,
      delta5yWealth,
      summary,
      newIncome,
      newExpenses,
      totalSip,
    });
  }, [incomeDelta, expenseCutPct, sipBoost, returnRate, baseData]);

  const handleSaveScenario = async () => {
    if (savedScenarios.length >= 3) {
      setSaveError('You can save up to 3 scenarios. Delete one first.');
      return;
    }
    setSavingScenario(true);
    setSaveError('');
    try {
      const name = scenarioName.trim() || `Scenario ${savedScenarios.length + 1}`;
      await scenarioService.saveScenario(name, {
        incomeDelta,
        expenseCutPct,
        sipBoost,
        returnRate,
      });
      setScenarioName('');
      loadSavedScenarios();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save scenario');
    } finally {
      setSavingScenario(false);
    }
  };

  const handleDeleteScenario = async (id) => {
    try {
      await scenarioService.deleteScenario(id);
      loadSavedScenarios();
    } catch (_) {}
  };

  const resetSliders = () => {
    setIncomeDelta(0);
    setExpenseCutPct(0);
    setSipBoost(0);
    setReturnRate(11);
  };

  // Trajectory chart data
  const trajectoryData = [1, 2, 3, 4, 5].map((year) => {
    const baseVal =
      compoundFV(baseData.existingInvestments, returnRate, year) +
      sipFutureValue(baseData.monthlySip, returnRate, year);
    const simVal =
      compoundFV(baseData.existingInvestments, returnRate, year) +
      sipFutureValue(simResults.totalSip, returnRate, year);
    return {
      year: `Yr ${year}`,
      baseline: Math.round(baseVal),
      simulated: Math.round(simVal),
    };
  });

  return (
    <PageWrapper>
      <div className="relative max-w-6xl mx-auto space-y-8">
        <CornerDecor variant="dots" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--blue-100)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--blue-50)] text-[var(--blue-700)] text-xs font-semibold mb-2">
              <Sliders size={15} />
              <span>What-If Simulator</span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--ink)]">What-If Financial Simulator</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Test "What if?" decisions before committing real money. See instant score & wealth changes.
            </p>
          </div>
          <button
            onClick={resetSliders}
            className="px-4 py-2 rounded-xl bg-white border border-[var(--blue-100)] hover:bg-[var(--blue-50)] text-[var(--ink)] text-xs font-semibold transition-all flex items-center gap-1.5 self-start md:self-auto shadow-xs"
          >
            <RotateCcw size={14} />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* Live plain-language summary banner */}
        <div className="p-5 rounded-2xl bg-[var(--blue-50)] border border-[var(--blue-200)] shadow-xs flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-white text-[var(--blue-500)] shadow-xs mt-0.5 shrink-0">
            <Sparkles size={20} />
          </span>
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--blue-700)] mb-1">
              Projected Outcome
            </h3>
            <p className="text-sm font-semibold text-[var(--ink)] leading-relaxed">
              {simResults.summary}
            </p>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Sliders Panel */}
          <div className="lg:col-span-6 bg-white border border-[var(--blue-100)] rounded-3xl p-6 shadow-xs space-y-6 relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" size={60} opacity={0.3} />

            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Sliders size={18} className="text-[var(--blue-500)]" />
              Decision Controls
            </h2>

            {/* Slider 1: Income Change */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--ink)] flex items-center gap-1">
                  Monthly Income Boost
                  <HelpTooltip text="Test what happens if you get a raise, stipend, or take a pay cut." />
                </span>
                <span className="text-[var(--blue-700)] font-bold">
                  {incomeDelta >= 0 ? `+₹${incomeDelta.toLocaleString('en-IN')}` : `-₹${Math.abs(incomeDelta).toLocaleString('en-IN')}`}
                </span>
              </div>
              <input
                type="range"
                min="-20000"
                max="50000"
                step="2500"
                value={incomeDelta}
                onChange={(e) => setIncomeDelta(Number(e.target.value))}
                className="w-full accent-[var(--blue-500)] cursor-pointer"
              />
              <div className="flex justify-between text-2xs text-[var(--muted)]">
                <span>-₹20k cut</span>
                <span>Current (₹{baseData.monthlyIncome.toLocaleString('en-IN')})</span>
                <span>+₹50k raise</span>
              </div>
            </div>

            {/* Slider 2: Spending Cut */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--ink)] flex items-center gap-1">
                  Trim Discretionary Expenses
                  <HelpTooltip text="Cut eating out, subscriptions, or shopping to see how fast savings grow." />
                </span>
                <span className="text-[var(--blue-700)] font-bold">{expenseCutPct}% cut</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={expenseCutPct}
                onChange={(e) => setExpenseCutPct(Number(e.target.value))}
                className="w-full accent-[var(--blue-500)] cursor-pointer"
              />
              <div className="flex justify-between text-2xs text-[var(--muted)]">
                <span>0% (no cut)</span>
                <span>25% cut</span>
                <span>50% deep cut</span>
              </div>
            </div>

            {/* Slider 3: SIP Boost */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--ink)] flex items-center gap-1">
                  Boost Monthly SIP
                  <HelpTooltip text="Extra investment put into mutual funds or index funds each month." />
                </span>
                <span className="text-[var(--blue-700)] font-bold">
                  +₹{sipBoost.toLocaleString('en-IN')}/mo
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25000"
                step="1000"
                value={sipBoost}
                onChange={(e) => setSipBoost(Number(e.target.value))}
                className="w-full accent-[var(--blue-500)] cursor-pointer"
              />
              <div className="flex justify-between text-2xs text-[var(--muted)]">
                <span>+₹0</span>
                <span>+₹10,000</span>
                <span>+₹25,000</span>
              </div>
            </div>

            {/* Slider 4: Expected Return Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--ink)] flex items-center gap-1">
                  Investment Return Rate
                  <HelpTooltip text="Average annual returns. 11-12% is typical for broad Indian equity index funds." />
                </span>
                <span className="text-[var(--blue-700)] font-bold">{returnRate}% per year</span>
              </div>
              <input
                type="range"
                min="8"
                max="16"
                step="0.5"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full accent-[var(--blue-500)] cursor-pointer"
              />
              <div className="flex justify-between text-2xs text-[var(--muted)]">
                <span>8% (Safe FD/Debt)</span>
                <span>12% (Equity Index)</span>
                <span>16% (Aggressive)</span>
              </div>
            </div>

            {/* Save Scenario Box */}
            <div className="pt-4 border-t border-[var(--blue-100)] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
                Save This Scenario ({savedScenarios.length}/3 saved)
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 15% Spending Cut Plan"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  maxLength={50}
                  className="flex-1 text-xs bg-[var(--blue-50)]/50 border border-[var(--blue-100)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--blue-500)]"
                />
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  disabled={savingScenario || savedScenarios.length >= 3}
                  className="px-4 py-2 rounded-xl bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white text-xs font-semibold transition-all disabled:opacity-40 flex items-center gap-1 shadow-xs"
                >
                  <BookmarkPlus size={15} />
                  <span>Save</span>
                </button>
              </div>
              {saveError && <p className="text-xs text-rose-500 font-semibold">{saveError}</p>}
            </div>
          </div>

          {/* Right: Instant Results & Projection */}
          <div className="lg:col-span-6 space-y-6">
            {/* Top Cards: Score & Style & 5Y Wealth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Score Card */}
              <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <span className="text-xs text-[var(--muted)] uppercase font-semibold block mb-1">
                  New Health Score
                </span>
                <div className="text-3xl font-extrabold text-[var(--ink)] flex items-baseline gap-1">
                  <AnimatedNumber value={simResults.simScore} />
                  <span className="text-xs font-normal text-[var(--muted)]">/100</span>
                </div>
                <div className="text-xs font-semibold text-[var(--blue-700)] mt-1">
                  Baseline: {baseData.baseScore}
                </div>
              </div>

              {/* Persona Card */}
              <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <span className="text-xs text-[var(--muted)] uppercase font-semibold block mb-1">
                  User Class
                </span>
                <div className="text-2xl font-extrabold text-[var(--blue-700)]">
                  {simResults.simPersona}
                </div>
                <div className="text-2xs text-[var(--muted)] mt-1">
                  {simResults.simPersona === 'Saver' ? 'Disciplined' : 'Balanced habit'}
                </div>
              </div>

              {/* 5-Year Wealth */}
              <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <span className="text-xs text-[var(--muted)] uppercase font-semibold block mb-1">
                  5-Year Wealth Creation
                </span>
                <div className="text-2xl font-extrabold text-[var(--ink)]">
                  ₹{(simResults.sim5yWealth / 100000).toFixed(1)}L
                </div>
                <div className="text-2xs font-bold text-emerald-600 mt-1">
                  +₹{(simResults.delta5yWealth / 100000).toFixed(1)}L gain
                </div>
              </div>
            </div>

            {/* 5-Year Trajectory Area Chart */}
            <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)]">
                    5-Year Savings Trajectory
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Current Path vs Your New What-If Scenario
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

              <div className="h-60">
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

        {/* SECTION: Compare Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <div className="card-soft p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--blue-100)] pb-3">
              <Layers size={18} className="text-[var(--blue-500)]" />
              <h3 className="text-base font-bold text-[var(--ink)]">
                Compare Your Saved Scenarios
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedScenarios.map((sc) => (
                <div
                  key={sc._id}
                  className="p-4 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--ink)] truncate">
                      {sc.name}
                    </span>
                    <button
                      onClick={() => handleDeleteScenario(sc._id)}
                      className="p-1 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete scenario"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[var(--muted)]">Projected Score:</span>
                    <span className="text-lg font-bold text-[var(--blue-700)]">
                      {sc.results?.simScore || 65}/100
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[var(--muted)]">5-Yr Wealth:</span>
                    <span className="font-bold text-[var(--ink)]">
                      ₹{((sc.results?.sim5yWealth || 0) / 100000).toFixed(1)} Lakh
                    </span>
                  </div>

                  <p className="text-2xs text-[var(--muted)] pt-2 border-t border-[var(--blue-100)] leading-relaxed">
                    {sc.results?.summary || 'Saved scenario comparison.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
