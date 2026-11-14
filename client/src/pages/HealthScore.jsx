import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  PiggyBank,
  PieChart,
  ShieldAlert,
  CreditCard,
  Briefcase,
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
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
import PageWrapper from '../components/layout/PageWrapper';
import { formatDate } from '../utils/formatters';

export default function HealthScore() {
  const [scoreData, setScoreData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchScore = async () => {
    try {
      setLoading(true);
      const [scoreRes, histRes] = await Promise.all([
        api.get('/health-score'),
        api.get('/health-score/history'),
      ]);
      setScoreData(scoreRes.data?.data || null);
      setHistory(histRes.data?.data?.history || []);
    } catch (err) {
      toast.error('Failed to load Health Score data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const { data } = await api.post('/health-score/calculate');
      setScoreData(data.data);
      toast.success('Health score recalculated and snapshot recorded!');
      // Refresh history
      const histRes = await api.get('/health-score/history');
      setHistory(histRes.data?.data?.history || []);
    } catch (err) {
      toast.error('Failed to recalculate score');
    } finally {
      setRecalculating(false);
    }
  };

  const componentIcons = {
    savingsRate: PiggyBank,
    expenseControl: PieChart,
    emergencyFund: ShieldCheck,
    debtToIncome: CreditCard,
    investmentRatio: TrendingUp,
    goalProgress: Target,
  };

  const componentNames = {
    savingsRate: 'Savings Rate',
    expenseControl: 'Expense Control',
    emergencyFund: 'Emergency Cushion',
    debtToIncome: 'Debt-to-Income',
    investmentRatio: 'Investment Ratio',
    goalProgress: 'Goal Progress',
  };

  return (
    <PageWrapper
      title="Financial Health Score"
      subtitle="Comprehensive 0–100 index evaluating your financial resilience, discipline, and trajectory."
      actions={
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Computing...' : 'Recalculate Score'}</span>
        </button>
      }
    >
      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">Evaluating financial metrics...</div>
      ) : !scoreData ? (
        <div className="py-24 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">No health score data available yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Score Hero Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Circular Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-gray-100 dark:text-gray-800"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke={scoreData.color || '#3b82f6'}
                    strokeWidth="10"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * scoreData.score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {scoreData.score}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Band & Summary */}
              <div className="max-w-md">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-2" style={{ backgroundColor: `${scoreData.color}20`, color: scoreData.color }}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {scoreData.band} Standing
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {scoreData.band === 'Excellent' && 'Outstanding Financial Health!'}
                  {scoreData.band === 'Good' && 'Strong Financial Trajectory'}
                  {scoreData.band === 'Fair' && 'Room for Financial Optimization'}
                  {scoreData.band === 'Poor' && 'Financial Health Needs Urgent Attention'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  {scoreData.summary}
                </p>
              </div>
            </div>

            {/* Score Band Legend */}
            <div className="w-full md:w-auto p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Score Tiers
              </span>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent (80–100)
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Good (60–79)
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Fair (40–59)
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Poor (0–39)
                </span>
              </div>
            </div>
          </div>

          {/* 6 Component Breakdown Cards */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              6 Financial Pillars Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(scoreData.components || {}).map(([key, comp]) => {
                const Icon = componentIcons[key] || ShieldCheck;
                const name = componentNames[key] || key;

                let badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
                if (comp.score < 40) badgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40';
                else if (comp.score < 60) badgeColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40';
                else if (comp.score < 80) badgeColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40';

                return (
                  <div
                    key={key}
                    className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{name}</h4>
                            <span className="text-[10px] text-gray-400">Weight: {comp.weight}% of Total</span>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                          {comp.score}/100
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                          style={{ width: `${comp.score}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs mb-3 text-gray-500">
                        <span>Current Metric:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {comp.rawValue} {comp.unit || ''}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      💡 {comp.tip}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Score Trend Chart */}
          {history.length > 1 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Health Score History Over Time</span>
              </h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDate(d)}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`${val} / 100`, 'Health Score']}
                      labelFormatter={(l) => formatDate(l)}
                      contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
