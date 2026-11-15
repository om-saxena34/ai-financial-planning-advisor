import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import FloatingElements from '../components/common/FloatingElements';
import AnimatedNumber from '../components/common/AnimatedNumber';
import { healthScoreService } from '../services/healthScore.service';
import { transactionService } from '../services/transaction.service';
import { goalService } from '../services/goal.service';
import { recommendationService } from '../services/recommendation.service';
import { predictionService } from '../services/prediction.service';
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
} from 'recharts';
import {
  TrendingUp,
  Wallet,
  Coins,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  Bot,
  ChevronRight,
} from 'lucide-react';

// Blue shades first palette
const BLUE_PALETTE = [
  '#5B9FD6', // Brand Blue 500
  '#2F6EA3', // Brand Blue 700
  '#7EB3E0', // Blue 400
  '#A9CFEE', // Blue 300
  '#C4DFF5', // Blue 200
  '#4EAB7E', // Soft Green
  '#E09B3D', // Soft Amber
  '#E26D6D', // Soft Coral
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [classification, setClassification] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [healthRes, summaryRes, goalsRes, recsRes, classRes, forecastRes] =
          await Promise.allSettled([
            healthScoreService.calculateScore(),
            transactionService.getSummary(),
            goalService.getGoals(),
            recommendationService.getRecommendations(),
            predictionService.classify(),
            predictionService.forecast(),
          ]);

        if (healthRes.status === 'fulfilled') setHealthData(healthRes.value.data);
        if (summaryRes.status === 'fulfilled') setSummaryData(summaryRes.value.data);
        if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data || []);
        if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data || []);
        if (classRes.status === 'fulfilled') setClassification(classRes.value.data);
        if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="py-24 text-center text-muted">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-ink">Loading your money overview...</p>
        </div>
      </PageWrapper>
    );
  }

  const score = healthData?.score ?? 72;
  const grade = healthData?.grade ?? 'Good';
  const income = summaryData?.summary?.totalIncome || 75000;
  const expenses = summaryData?.summary?.totalExpense || 45000;
  const savings = Math.max(0, income - expenses);
  const savingsRate = summaryData?.ratios?.savingsRate
    ? (summaryData.ratios.savingsRate * 100).toFixed(1)
    : ((savings / income) * 100).toFixed(1);

  const predictedClass = classification?.predicted_class || 'Balanced';
  const personaBadgeStyles = {
    Saver: 'bg-good-bg text-good border-good/30',
    Balanced: 'bg-brand-50 text-brand-700 border-brand-200',
    Overspender: 'bg-bad-bg text-bad border-bad/30',
  };

  const categoryData =
    summaryData?.categoryBreakdown?.map((cat) => ({
      name: cat.category,
      value: cat.total,
    })) || [
      { name: 'Rent', value: 18000 },
      { name: 'Food', value: 9500 },
      { name: 'Transport', value: 4200 },
      { name: 'Utilities', value: 3800 },
      { name: 'Entertainment', value: 4500 },
      { name: 'Shopping', value: 5000 },
    ];

  const trendData = summaryData?.monthlyTrend?.map((item) => ({
    month: item.month,
    income: item.income,
    expense: item.expense,
  })) || [
    { month: 'Jun', income: 75000, expense: 48000 },
    { month: 'Jul', income: 75000, expense: 46000 },
    { month: 'Aug', income: 75000, expense: 52000 },
    { month: 'Sep', income: 78000, expense: 47000 },
    { month: 'Oct', income: 78000, expense: 44000 },
    { month: 'Nov', income: 80000, expense: 45000 },
  ];

  return (
    <PageWrapper title="Your Money Dashboard">
      {/* Top Banner / Persona Header */}
      <div className="bg-white border border-brand-100 rounded-3xl p-6 sm:p-7 mb-7 shadow-card relative overflow-hidden">
        <CornerDecor variant="wave" position="bottom-right" opacity={0.65} />
        <FloatingElements variant="dashboard" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Your Spending Pattern
              </span>
              <HelpTooltip
                title="Spending Pattern"
                text="How you spend and save. Savers keep 30%+ of income, Balanced keep 15-30%, and Overspenders spend almost everything."
              />
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  personaBadgeStyles[predictedClass] || personaBadgeStyles.Balanced
                }`}
              >
                ● {predictedClass}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-ink">
              Welcome back to your Advisor
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Your Money Health Score is{' '}
              <strong className="text-brand-700 font-semibold">{grade} ({score}/100)</strong>. Keep your savings steady to stay on track.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/what-if"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-brand-600" />
              What-If Simulator
            </Link>
            <Link
              to="/insights"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl shadow-card transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pattern Details
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-card hover:shadow-hover transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Monthly Inflow</span>
            <Wallet className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-heading font-bold text-ink">
            <AnimatedNumber value={income} prefix="₹" formatIndian={true} />
          </div>
          <div className="text-xs text-good flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Stable monthly income
          </div>
        </div>

        <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-card hover:shadow-hover transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Monthly Expenses</span>
            <Coins className="w-4 h-4 text-bad" />
          </div>
          <div className="text-2xl font-heading font-bold text-ink">
            <AnimatedNumber value={expenses} prefix="₹" formatIndian={true} />
          </div>
          <div className="text-xs text-muted mt-1">
            {Math.round((expenses / income) * 100)}% of your monthly money
          </div>
        </div>

        <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-card hover:shadow-hover transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Monthly Savings</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-brand-600">
            {savingsRate}%
          </div>
          <div className="text-xs text-muted mt-1">
            ₹{savings.toLocaleString('en-IN')} left over each month
          </div>
        </div>

        <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-card hover:shadow-hover transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Health Score</span>
            <ShieldCheck className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-heading font-bold text-ink">
              <AnimatedNumber value={score} />
            </div>
            <span className="text-xs text-muted">/ 100</span>
            <span className="text-xs font-bold text-brand-600 ml-auto">
              {grade}
            </span>
          </div>
          <div className="w-full h-1.5 bg-brand-50 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Forecast & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
        {/* Cash Flow Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-brand-100 rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-heading font-bold text-ink">
                Income vs Spending Over Time
              </h2>
              <p className="text-xs text-muted">Your last 6 months of cash flow</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs text-brand-600 font-semibold hover:underline"
            >
              All Expenses →
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B9FD6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5B9FD6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E26D6D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E26D6D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EEF6" />
                <XAxis dataKey="month" stroke="#6B7F92" fontSize={11} />
                <YAxis
                  stroke="#6B7F92"
                  fontSize={11}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#DCEBF8',
                    borderRadius: '0.75rem',
                    color: '#1E3246',
                    fontSize: '12px',
                    boxShadow: '0 4px 16px rgba(30, 50, 70, 0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#5B9FD6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInc)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#E26D6D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wealth Forecast Card (1 Col) */}
        <div className="bg-brand-50 border border-brand-100 rounded-3xl p-6 text-ink flex flex-col justify-between shadow-card relative overflow-hidden">
          <CornerDecor variant="arc" position="top-right" opacity={0.35} />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-brand-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Wealth Forecast
              </span>
              <HelpTooltip
                title="Wealth Forecast"
                text="Estimates how much money you can save in 12 months and 5 years if you keep up your current monthly savings."
              />
            </div>
            <h3 className="text-base font-heading font-bold mb-1">Where your money can go</h3>
            <p className="text-xs text-muted mb-5 leading-relaxed">
              Based on your monthly surplus and compound interest over time.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-brand-100 shadow-xs">
                <span className="text-[11px] text-muted uppercase font-bold tracking-wider block mb-0.5">
                  12-Month Expected Savings
                </span>
                <span className="text-xl font-heading font-extrabold text-good">
                  ₹{(forecast?.predicted_savings_12m || savings * 12).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-brand-100 shadow-xs">
                <span className="text-[11px] text-muted uppercase font-bold tracking-wider block mb-0.5">
                  5-Year Estimated Wealth
                </span>
                <span className="text-xl font-heading font-extrabold text-brand-700">
                  ₹{(forecast?.predicted_wealth_5y || savings * 60 * 1.3).toLocaleString('en-IN')}
                </span>
                <div className="text-[10px] text-muted mt-1">
                  Estimated range: ₹
                  {(forecast?.confidence_band?.lower_bound || 0).toLocaleString('en-IN')} – ₹
                  {(forecast?.confidence_band?.upper_bound || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-200/60 mt-5 relative z-10">
            <Link
              to="/what-if"
              className="w-full block text-center py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              See What-If Scenarios →
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Category Breakdown & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
        {/* Category Donut (1 Col) */}
        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-card">
          <h2 className="text-base font-heading font-bold text-ink mb-0.5">
            Where Your Money Goes
          </h2>
          <p className="text-xs text-muted mb-4">Your spending broken down by category</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BLUE_PALETTE[index % BLUE_PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.5rem',
                    borderColor: '#DCEBF8',
                    color: '#1E3246',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(30, 50, 70, 0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: BLUE_PALETTE[idx % BLUE_PALETTE.length] }}
                />
                <span className="truncate">{cat.name}:</span>
                <strong className="ml-auto text-ink">₹{(cat.value / 1000).toFixed(0)}k</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress Mini Widget (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-brand-100 rounded-3xl p-6 shadow-card flex flex-col justify-between relative overflow-hidden">
          <CornerDecor variant="dots" position="top-right" opacity={0.2} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-heading font-bold text-ink">
                  Your Savings Goals
                </h2>
                <p className="text-xs text-muted">Milestones you are working towards</p>
              </div>
              <Link
                to="/goals"
                className="text-xs text-brand-600 font-semibold hover:underline"
              >
                All Goals →
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="py-10 text-center text-muted">
                <Target className="w-9 h-9 text-brand-300 mx-auto mb-2 opacity-60" />
                <p className="text-xs">No active goals yet. Add a target to begin tracking!</p>
                <Link
                  to="/goals"
                  className="inline-block mt-3 px-3 py-1.5 bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Create Goal
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {goals.slice(0, 3).map((g) => (
                  <div
                    key={g._id}
                    className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-ink">
                        {g.title}
                      </span>
                      <span className="text-xs text-muted">
                        ₹{(g.currentAmount || 0).toLocaleString('en-IN')} of ₹
                        {g.targetAmount.toLocaleString('en-IN')} ({g.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, g.progressPercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>Monthly savings needed: ₹{(g.requiredMonthlySIP || 0).toLocaleString('en-IN')}/mo</span>
                      <span
                        className={
                          g.feasibility?.isOnTrack
                            ? 'text-good font-semibold'
                            : 'text-warn font-semibold'
                        }
                      >
                        {g.feasibility?.isOnTrack ? '✓ On Track' : '⚠ Feasibility Alert'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3.5 border-t border-brand-100 mt-4 flex items-center justify-between text-xs text-muted relative z-10">
            <span>
              Active Goals: <strong>{goals.filter((g) => g.status === 'in_progress').length}</strong>
            </span>
            <Link to="/calculators/sip" className="text-brand-600 font-medium hover:underline">
              SIP Calculator →
            </Link>
          </div>
        </div>
      </div>

      {/* Helpful Tips for You Banner */}
      <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <h2 className="text-base font-heading font-bold text-ink">
              Helpful Tips for You
            </h2>
          </div>
          <Link
            to="/recommendations"
            className="text-xs text-brand-600 font-semibold hover:underline"
          >
            All Tips ({recommendations.length}) →
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-xs text-muted">No pending recommendations. You're doing great!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec._id}
                className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        rec.priority === 'high'
                          ? 'bg-bad-bg text-bad'
                          : 'bg-warn-bg text-warn'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    {rec.potentialMonthlyImpact > 0 && (
                      <span className="text-xs font-bold text-good">
                        +₹{rec.potentialMonthlyImpact.toLocaleString('en-IN')}/mo
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-ink text-sm mb-1">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2">
                    {rec.text}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-brand-100 flex items-center justify-between">
                  <span className="text-[10px] text-muted uppercase font-semibold">
                    {rec.category}
                  </span>
                  <Link
                    to="/recommendations"
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Take Action →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
