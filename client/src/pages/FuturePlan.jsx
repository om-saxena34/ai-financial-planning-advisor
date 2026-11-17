import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  FileSpreadsheet,
  Save,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import ReadinessLadder from '../components/FuturePlan/ReadinessLadder';
import { lifePlanService } from '../services/lifePlan.service';
import { exportLifePlanPdf } from '../utils/pdfExport';
import { exportLifePlanCsv } from '../utils/csvExport';

function formatRupee(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export default function FuturePlan() {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [readinessLadder, setReadinessLadder] = useState(null);
  const [planResult, setPlanResult] = useState(null);

  // Form Controls State
  const [currentIncome, setCurrentIncome] = useState(60000);
  const [currentExpenses, setCurrentExpenses] = useState(35000);
  const [existingSavings, setExistingSavings] = useState(40000);
  const [timelineYears, setTimelineYears] = useState(10);
  const [salaryGrowthRate, setSalaryGrowthRate] = useState(8);
  const [startingSip, setStartingSip] = useState(4000);
  const [comfortLevel, setComfortLevel] = useState('balanced');
  const [investWhen, setInvestWhen] = useState('now');
  const [investThreshold, setInvestThreshold] = useState(50000);

  // Life Events & Milestones
  const [lifeEvents, setLifeEvents] = useState([
    { year: 3, name: 'Higher Studies or Vehicle', amount: 150000 },
  ]);
  const [newEventYear, setNewEventYear] = useState(2);
  const [newEventName, setNewEventName] = useState('');
  const [newEventAmount, setNewEventAmount] = useState('');

  // Initial Load: Readiness & Defaults
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [readinessRes, savedRes] = await Promise.allSettled([
          lifePlanService.getReadiness(),
          lifePlanService.getSavedPlan(),
        ]);

        if (readinessRes.status === 'fulfilled' && readinessRes.value?.data) {
          setReadinessLadder(readinessRes.value.data);
        }

        if (savedRes.status === 'fulfilled' && savedRes.value?.data) {
          const s = savedRes.value.data;
          if (s.timelineYears) setTimelineYears(s.timelineYears);
          if (s.comfortLevel) setComfortLevel(s.comfortLevel);
          if (s.investWhen) setInvestWhen(s.investWhen);
          if (s.startingSip !== undefined) setStartingSip(s.startingSip);
          if (s.salaryGrowthRate) setSalaryGrowthRate(s.salaryGrowthRate);
          if (s.lifeEvents && s.lifeEvents.length > 0) setLifeEvents(s.lifeEvents);
        }
      } catch (err) {
        console.error('Error loading life plan data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  // Recalculate projection whenever parameters change
  useEffect(() => {
    let active = true;
    async function runProjection() {
      try {
        setCalculating(true);
        const payload = {
          currentIncome,
          currentExpenses,
          existingSavings,
          timelineYears,
          salaryGrowthRate,
          startingSip: investWhen === 'never_safe_only' ? 0 : startingSip,
          comfortLevel: investWhen === 'never_safe_only' ? 'safe_only' : comfortLevel,
          investWhen,
          investThreshold,
          lifeEvents,
        };

        const res = await lifePlanService.projectPlan(payload);
        if (active && res?.data) {
          setPlanResult(res.data);
        }
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        if (active) setCalculating(false);
      }
    }

    runProjection();
    return () => {
      active = false;
    };
  }, [
    currentIncome,
    currentExpenses,
    existingSavings,
    timelineYears,
    salaryGrowthRate,
    startingSip,
    comfortLevel,
    investWhen,
    investThreshold,
    lifeEvents,
  ]);

  const handleAddLifeEvent = () => {
    if (!newEventName.trim() || !newEventAmount) {
      toast.error('Please enter event name and cost');
      return;
    }
    const cost = Math.max(0, Number(newEventAmount) || 0);
    setLifeEvents((prev) => [
      ...prev,
      { year: Number(newEventYear) || 1, name: newEventName.trim(), amount: cost },
    ]);
    setNewEventName('');
    setNewEventAmount('');
    toast.success('Life milestone added');
  };

  const handleRemoveLifeEvent = (index) => {
    setLifeEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePlan = async () => {
    try {
      const payload = {
        title: `My ${timelineYears}-Year Future Life Plan`,
        comfortLevel: investWhen === 'never_safe_only' ? 'safe_only' : comfortLevel,
        investWhen,
        investThreshold,
        startingSip: investWhen === 'never_safe_only' ? 0 : startingSip,
        salaryGrowthRate,
        timelineYears,
        lifeEvents,
        summary: {
          finalNominal: planResult?.years?.[planResult.years.length - 1]?.totalNetWorthNominal || 0,
          finalReal: planResult?.years?.[planResult.years.length - 1]?.totalNetWorthReal || 0,
          costOfWaiting3Years: planResult?.costOfWaiting?.costOf3YearsLost || 0,
          readinessStep: readinessLadder?.currentStep || 1,
        },
      };

      await lifePlanService.savePlan(payload);
      toast.success('Life Plan saved to your account!');
    } catch (err) {
      console.error('Failed to save plan:', err);
      toast.error(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleExportPdf = () => {
    if (!planResult) return;
    exportLifePlanPdf(planResult, readinessLadder);
    toast.success('PDF report downloaded!');
  };

  const handleExportCsv = () => {
    if (!planResult) return;
    exportLifePlanCsv(planResult);
    toast.success('CSV table downloaded!');
  };

  // Prepare chart data
  const chartData = (planResult?.years || []).map((yr) => ({
    name: `Yr ${yr.year}`,
    nominal: yr.totalNetWorthNominal,
    real: yr.totalNetWorthReal,
    invested: yr.investmentValueNominal,
    savings: yr.cashSavingsBalance,
  }));

  const lastYearData = planResult?.years?.[planResult.years.length - 1];

  return (
    <PageWrapper title="Future Life Plan & Wealth Projection">
      <div className="space-y-6 relative">
        <CornerDecor variant="wave" position="top-right" opacity={0.3} />

        {/* ── Page Header ── */}
        <div className="bg-surface rounded-2xl border border-brand-100 p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h1 className="font-heading font-extrabold text-2xl text-ink">
                Future Life Plan
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
              Look ahead 5 to 25 years. Simulate salary raises, life milestones, and see how much your money will actually buy after inflation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-surface border border-brand-200 text-ink hover:text-brand-700 hover:border-brand-300 transition-all shadow-2xs hover:shadow-xs"
            >
              <Download className="w-4 h-4 text-brand-500" /> Export PDF
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-surface border border-brand-200 text-ink hover:text-brand-700 hover:border-brand-300 transition-all shadow-2xs hover:shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-500" /> CSV Table
            </button>
            <button
              onClick={handleSavePlan}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-xs"
            >
              <Save className="w-4 h-4" /> Save Plan
            </button>
          </div>
        </div>

        {/* ── 5-Step Readiness Ladder (Non-investor respectful foundation) ── */}
        <ReadinessLadder ladder={readinessLadder} />

        {/* ── Core Planning Controls ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Controls & Simulation Sliders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-brand-50 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-500" />
                  <h3 className="font-heading font-bold text-base text-ink">
                    Life Simulation Settings
                  </h3>
                </div>
                <span className="text-xs text-muted">Real-time compound modeling</span>
              </div>

              {/* "How do you feel about investing?" Selector */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-ink flex items-center gap-1.5">
                  <span>How do you feel about investing?</span>
                  <HelpTooltip text="Pick what feels comfortable today. You can always change this later." />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setInvestWhen('now')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      investWhen === 'now'
                        ? 'bg-brand-50 border-brand-400 font-semibold text-brand-900 shadow-2xs'
                        : 'bg-surface border-brand-100 text-muted hover:border-brand-200'
                    }`}
                  >
                    <p className="font-bold text-ink">Ready to start small</p>
                    <p className="text-[11px] text-muted mt-0.5">Start a steady monthly SIP from today.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvestWhen('when_salary_hits')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      investWhen === 'when_salary_hits'
                        ? 'bg-brand-50 border-brand-400 font-semibold text-brand-900 shadow-2xs'
                        : 'bg-surface border-brand-100 text-muted hover:border-brand-200'
                    }`}
                  >
                    <p className="font-bold text-ink">When salary reaches ₹50k+</p>
                    <p className="text-[11px] text-muted mt-0.5">Wait until your income crosses a stable threshold.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvestWhen('after_years')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      investWhen === 'after_years'
                        ? 'bg-brand-50 border-brand-400 font-semibold text-brand-900 shadow-2xs'
                        : 'bg-surface border-brand-100 text-muted hover:border-brand-200'
                    }`}
                  >
                    <p className="font-bold text-ink">After 2 years of saving</p>
                    <p className="text-[11px] text-muted mt-0.5">Focus purely on bank buffer first.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvestWhen('never_safe_only')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      investWhen === 'never_safe_only'
                        ? 'bg-brand-50 border-brand-400 font-semibold text-brand-900 shadow-2xs'
                        : 'bg-surface border-brand-100 text-muted hover:border-brand-200'
                    }`}
                  >
                    <p className="font-bold text-ink">Safe savings only (No market risk)</p>
                    <p className="text-[11px] text-muted mt-0.5">Zero pressure. Plan with bank FD, RD & savings.</p>
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Timeline slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-ink">Plan Horizon:</span>
                    <span className="font-bold text-brand-600">{timelineYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={timelineYears}
                    onChange={(e) => setTimelineYears(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono">
                    <span>5 yrs</span>
                    <span>15 yrs</span>
                    <span>25 yrs</span>
                  </div>
                </div>

                {/* Annual Salary Growth slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-ink">Expected Annual Raise:</span>
                    <span className="font-bold text-brand-600">{salaryGrowthRate}% / year</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={salaryGrowthRate}
                    onChange={(e) => setSalaryGrowthRate(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono">
                    <span>3% (Modest)</span>
                    <span>8% (Avg)</span>
                    <span>20% (Fast)</span>
                  </div>
                </div>

                {/* Starting SIP slider (if investing enabled) */}
                {investWhen !== 'never_safe_only' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-ink">Starting Monthly SIP:</span>
                      <span className="font-bold text-brand-600">{formatRupee(startingSip)}/mo</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="30000"
                      step="500"
                      value={startingSip}
                      onChange={(e) => setStartingSip(Number(e.target.value))}
                      className="w-full accent-brand-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted font-mono">
                      <span>₹500</span>
                      <span>₹15,000</span>
                      <span>₹30,000</span>
                    </div>
                  </div>
                )}

                {/* Risk Comfort */}
                {investWhen !== 'never_safe_only' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink block">
                      Investment Return Expectation:
                    </label>
                    <select
                      value={comfortLevel}
                      onChange={(e) => setComfortLevel(e.target.value)}
                      className="w-full text-xs bg-bg border border-brand-100 rounded-xl p-2.5 text-ink focus:outline-none focus:border-brand-500"
                    >
                      <option value="cautious">Cautious / Conservative (~8% p.a.)</option>
                      <option value="balanced">Balanced Multi-Asset (~11% p.a.)</option>
                      <option value="growth">Disciplined Equity (~14% p.a.)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Life Events & Milestones Card */}
            <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-brand-50 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <h3 className="font-heading font-bold text-base text-ink">
                    Upcoming Life Milestones & Expenses
                  </h3>
                </div>
                <span className="text-xs text-muted">Deducted from surplus in target year</span>
              </div>

              {/* Event list */}
              <div className="space-y-2">
                {lifeEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-brand-50/50 rounded-xl border border-brand-100/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-700 bg-surface px-2 py-0.5 rounded-md border border-brand-100">
                        Year {evt.year}
                      </span>
                      <span className="font-medium text-ink">{evt.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-ink">{formatRupee(evt.amount)}</span>
                      <button
                        onClick={() => handleRemoveLifeEvent(idx)}
                        className="text-muted hover:text-bad p-1 transition-colors"
                        title="Remove milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Event Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={newEventYear}
                  onChange={(e) => setNewEventYear(Number(e.target.value))}
                  className="text-xs bg-bg border border-brand-100 rounded-xl p-2 text-ink focus:outline-none"
                >
                  {Array.from({ length: timelineYears }, (_, i) => i + 1).map((yr) => (
                    <option key={yr} value={yr}>
                      Year {yr}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Event name (e.g. Wedding, Car, Degree)"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="flex-1 text-xs bg-bg border border-brand-100 rounded-xl px-3 py-2 text-ink placeholder:text-muted focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Cost (₹)"
                  value={newEventAmount}
                  onChange={(e) => setNewEventAmount(e.target.value)}
                  className="w-28 text-xs bg-bg border border-brand-100 rounded-xl px-3 py-2 text-ink placeholder:text-muted focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleAddLifeEvent}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Executive Wealth Projection Cards */}
          <div className="space-y-4">
            {/* Total Nominal Wealth */}
            <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                In {timelineYears} Years (Nominal Total)
              </span>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-700">
                {formatRupee(lastYearData?.totalNetWorthNominal)}
              </p>
              <p className="text-xs text-muted pt-1">
                Cash balance: {formatRupee(lastYearData?.cashSavingsBalance)} • Investments:{' '}
                {formatRupee(lastYearData?.investmentValueNominal)}
              </p>
            </div>

            {/* Real Inflation-Adjusted Purchasing Power */}
            <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Real Purchasing Power
                </span>
                <span className="text-[10px] bg-good/10 text-good font-bold px-2 py-0.5 rounded-full">
                  6% Inflation Adjusted
                </span>
              </div>
              <p className="text-2xl font-heading font-extrabold text-ink">
                {formatRupee(lastYearData?.totalNetWorthReal)}
              </p>
              <p className="text-xs text-muted pt-1 leading-relaxed">
                What this corpus will genuinely buy in today's rupee value after accounting for grocery and rent price rises.
              </p>
            </div>

            {/* Cost of Waiting 3 Years Box */}
            {planResult?.costOfWaiting && (
              <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>The Real Cost of Waiting</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  If you delay starting a small regular habit by just 3 years, compound interest loss equals:
                </p>
                <p className="text-xl font-heading font-extrabold text-warn">
                  -{formatRupee(planResult.costOfWaiting.costOf3YearsLost)}
                </p>
                <p className="text-[11px] text-muted">
                  Starting today with even ₹500/mo puts time on your side.
                </p>
              </div>
            )}

            {/* Scenario Band */}
            {planResult?.scenarioRange && (
              <div className="bg-brand-50/60 rounded-2xl border border-brand-100 p-4 shadow-card text-xs space-y-2">
                <span className="font-heading font-bold text-ink block">
                  Probable Wealth Range:
                </span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted">Conservative:</span>
                  <span className="font-bold text-ink">
                    {formatRupee(planResult.scenarioRange.cautious)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted">Balanced Target:</span>
                  <span className="font-bold text-brand-600">
                    {formatRupee(planResult.scenarioRange.balanced)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted">Optimistic Growth:</span>
                  <span className="font-bold text-good">
                    {formatRupee(planResult.scenarioRange.growth)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Wealth Growth Curve (Area Chart) ── */}
        <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-50 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-ink">
                Nominal Wealth vs Real Purchasing Power
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Blue shows your total bank & investment balance; Green shows what it buys after inflation.
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="nominalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A5C95" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1A5C95" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#9FB1C2" fontSize={11} />
                <YAxis
                  stroke="#9FB1C2"
                  fontSize={11}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(val) => [formatRupee(val)]}
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="nominal"
                  name="Nominal Total Net Worth"
                  stroke="#1A5C95"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#nominalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="real"
                  name="Inflation-Adjusted Real Value"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#realGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Year-by-Year Table ── */}
        <div className="bg-surface rounded-2xl border border-brand-100 p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-ink">
              Year-by-Year Financial Breakdown
            </h3>
            <span className="text-xs text-muted">All values in INR</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50/60 text-ink-secondary border-b border-brand-100 font-heading">
                <tr>
                  <th className="p-2.5">Year</th>
                  <th className="p-2.5">Monthly Income</th>
                  <th className="p-2.5">Monthly Bills</th>
                  <th className="p-2.5">Monthly SIP</th>
                  <th className="p-2.5">Bank Balance</th>
                  <th className="p-2.5">Net Worth (Nominal)</th>
                  <th className="p-2.5">Real Value (Adj)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {(planResult?.years || []).map((yr) => (
                  <tr key={yr.year} className="hover:bg-brand-50/30 transition-colors">
                    <td className="p-2.5 font-bold text-ink">Year {yr.year}</td>
                    <td className="p-2.5 text-ink">{formatRupee(yr.monthlyIncome)}</td>
                    <td className="p-2.5 text-muted">{formatRupee(yr.monthlyExpenses)}</td>
                    <td className="p-2.5 text-brand-600 font-semibold">{formatRupee(yr.monthlySip)}</td>
                    <td className="p-2.5 text-ink">{formatRupee(yr.cashSavingsBalance)}</td>
                    <td className="p-2.5 font-bold text-brand-700">{formatRupee(yr.totalNetWorthNominal)}</td>
                    <td className="p-2.5 font-semibold text-good">{formatRupee(yr.totalNetWorthReal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Honest Disclaimer ── */}
        <p className="text-[11px] text-muted text-center italic">
          💡 Projections are educational simulations using standard compound math and historical averages. Returns are subject to market fluctuations and are not guarantees.
        </p>
      </div>
    </PageWrapper>
  );
}
