import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
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
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Wallet,
  Coins,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';

const CATEGORY_COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
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
        <div className="py-24 text-center text-gray-500">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Synthesizing your financial telemetry and AI predictions...
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

  // Behavioral persona formatting
  const predictedClass = classification?.predicted_class || 'Balanced';
  const personaBadgeStyles = {
    Saver: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    Balanced: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    Overspender: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  // Category breakdown data for pie chart
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

  // 6-Month cash flow trend
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
    <PageWrapper title="Advisor Dashboard">
      {/* Top Banner / Persona Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                AI Financial Persona
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  personaBadgeStyles[predictedClass] || personaBadgeStyles.Balanced
                }`}
              >
                ● {predictedClass}
              </span>
              {classification?.is_fallback && (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                  Heuristic Fallback
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Welcome back to your Advisor
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Your financial health score is rated{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">{grade}</strong> based on six objective pillars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/what-if"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition-all"
            >
              <Sliders className="w-4 h-4" />
              What-If Simulator
            </Link>
            <Link
              to="/insights"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Model Insights
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Monthly Income
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{income.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Stable inflow
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Monthly Expenses
            <Coins className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{expenses.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((expenses / income) * 100)}% of monthly earnings
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Savings Rate
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {savingsRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ₹{savings.toLocaleString('en-IN')} surplus / month
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Health Score
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {score}
            </div>
            <span className="text-xs text-gray-400 font-semibold">/ 100</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 ml-auto">
              {grade}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Forecast & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cash Flow Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Income vs Expense Flow
              </h2>
              <p className="text-xs text-gray-500">6-Month monthly historical distribution</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View All Transactions →
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInc)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Wealth Forecast Card (1 Col) */}
        <div className="bg-gradient-to-br from-indigo-900 to-gray-900 border border-indigo-800 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>ML Predictive Forecast</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold mb-1">Projected Future Wealth</h3>
            <p className="text-xs text-indigo-200 mb-6 leading-relaxed">
              Based on your GradientBoosting regressor model trained on multi-year compounding trajectories.
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider block">
                  12-Month Projected Savings
                </span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  ₹{(forecast?.predicted_savings_12m || savings * 12).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider block">
                  5-Year Estimated Wealth
                </span>
                <span className="text-2xl font-extrabold text-white">
                  ₹{(forecast?.predicted_wealth_5y || savings * 60 * 1.3).toLocaleString('en-IN')}
                </span>
                <div className="text-[11px] text-indigo-300 mt-1">
                  Confidence band: ₹
                  {(forecast?.confidence_band?.lower_bound || 0).toLocaleString('en-IN')} – ₹
                  {(forecast?.confidence_band?.upper_bound || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-6">
            <Link
              to="/what-if"
              className="w-full block text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all"
            >
              Simulate Income / SIP Boost →
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Category Breakdown & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Category Donut (1 Col) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Expense Allocation
          </h2>
          <p className="text-xs text-gray-500 mb-4">Current monthly spending distribution</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                />
                <span className="truncate">{cat.name}:</span>
                <strong className="ml-auto">₹{(cat.value / 1000).toFixed(0)}k</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress Mini Widget (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Active Financial Goals
                </h2>
                <p className="text-xs text-gray-500">Milestones and required SIP monthly pace</p>
              </div>
              <Link
                to="/goals"
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Manage Goals →
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Target className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs">No active goals yet. Add a target to begin tracking!</p>
                <Link
                  to="/goals"
                  className="inline-block mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg"
                >
                  Create Goal
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 3).map((g) => (
                  <div
                    key={g._id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {g.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        ₹{(g.currentAmount || 0).toLocaleString('en-IN')} / ₹
                        {g.targetAmount.toLocaleString('en-IN')} ({g.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, g.progressPercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Required SIP: ₹{(g.requiredMonthlySIP || 0).toLocaleString('en-IN')}/mo</span>
                      <span
                        className={
                          g.feasibility?.isOnTrack
                            ? 'text-emerald-600 font-semibold'
                            : 'text-amber-500 font-semibold'
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

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>
              Total Goals Active: <strong>{goals.filter((g) => g.status === 'in_progress').length}</strong>
            </span>
            <Link to="/calculators/sip" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Open SIP Calculator →
            </Link>
          </div>
        </div>
      </div>

      {/* Top Recommendations Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Priority AI Directives
            </h2>
          </div>
          <Link
            to="/recommendations"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            All Recommendations ({recommendations.length}) →
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-xs text-gray-500">No pending recommendations. You're doing great!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec._id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        rec.priority === 'high'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    {rec.potentialMonthlyImpact > 0 && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +₹{rec.potentialMonthlyImpact.toLocaleString('en-IN')}/mo
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {rec.text}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">
                    {rec.category}
                  </span>
                  <Link
                    to="/recommendations"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Act Now →
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
