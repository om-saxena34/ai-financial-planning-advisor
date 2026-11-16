import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  PiggyBank,
  PieChart,
  CreditCard,
  Target,
  CheckCircle2,
  AlertCircle,
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
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
import WhyPanel from '../components/common/WhyPanel';
import { formatDate } from '../utils/formatters';
import { HelpCircle } from 'lucide-react';

export default function HealthScore() {
  const [scoreData, setScoreData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

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
      toast.success('Money health score updated!');
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
    savingsRate: 'Monthly Savings',
    expenseControl: 'Bill & Rent Control',
    emergencyFund: 'Emergency Safety Cash',
    debtToIncome: 'Loan Burden (DTI)',
    investmentRatio: 'Investments & SIPs',
    goalProgress: 'Progress on Goals',
  };

  const componentTooltips = {
    savingsRate: 'The portion of your monthly income that you keep as savings (target: 20%+).',
    expenseControl: 'Keeping your essential bills and rent low enough so you have breathing room.',
    emergencyFund: 'Cash set aside for urgent needs like medical bills (aim for 3 to 6 months of expenses).',
    debtToIncome: 'How much of your monthly salary goes toward paying back loans or credit card EMIs.',
    investmentRatio: 'Money put into mutual funds or long-term assets so inflation does not eat your wealth.',
    goalProgress: 'Whether your current monthly savings pace will reach your target goals on time.',
  };

  const getScoreColor = (sc) => {
    if (sc >= 80) return '#4EAB7E'; // Gentle Sage Green
    if (sc >= 60) return '#5B9FD6'; // Brand Blue
    if (sc >= 40) return '#E09B3D'; // Warm Amber
    return '#E26D6D'; // Soft Coral
  };

  return (
    <PageWrapper
      title="Money Health Score"
      subtitle="A simple 0 to 100 check on your savings, emergency cushion, and loan discipline."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWhyOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-all shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            <span>Why this score?</span>
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-card transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Calculating...' : 'Recalculate Score'}</span>
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="py-24 text-center text-sm text-muted">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Checking your numbers...
        </div>
      ) : !scoreData ? (
        <div className="py-24 text-center">
          <AlertCircle className="w-10 h-10 text-warn mx-auto mb-2" />
          <p className="text-muted text-sm">No health score data available yet.</p>
        </div>
      ) : (
        <div className="space-y-7">
          {/* Main Score Hero Card */}
          <div className="p-7 sm:p-9 rounded-3xl bg-white border border-brand-100 shadow-card flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" opacity={0.35} />

            <div className="flex flex-col sm:flex-row items-center gap-7 text-center sm:text-left relative z-10">
              {/* Circular Gauge with Soft Glow Filter */}
              <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <defs>
                    <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={getScoreColor(scoreData.score)} floodOpacity="0.45" />
                    </filter>
                  </defs>
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#EEF6FC"
                    strokeWidth="11"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke={getScoreColor(scoreData.score)}
                    strokeWidth="11"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * scoreData.score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    filter="url(#gauge-glow)"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-heading font-extrabold text-ink">
                    <AnimatedNumber value={scoreData.score} />
                  </span>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Band & Summary */}
              <div className="max-w-md">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-2 border"
                  style={{
                    backgroundColor: `${getScoreColor(scoreData.score)}15`,
                    color: getScoreColor(scoreData.score),
                    borderColor: `${getScoreColor(scoreData.score)}30`,
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {scoreData.band} Standing
                </div>
                <h3 className="text-xl font-heading font-bold text-ink">
                  {scoreData.band === 'Excellent' && 'Superb Financial Discipline!'}
                  {scoreData.band === 'Good' && 'Strong, Healthy Money Habits'}
                  {scoreData.band === 'Fair' && 'Good Start — Small Changes Will Help'}
                  {scoreData.band === 'Poor' && 'Needs a Quick Reset on Spending'}
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1.5 leading-relaxed">
                  {scoreData.summary}
                </p>
              </div>
            </div>

            {/* Score Band Legend */}
            <div className="w-full md:w-auto p-4 rounded-2xl bg-brand-50/60 border border-brand-100 text-xs space-y-2 relative z-10">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                Score Levels
              </span>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-good font-semibold">
                  <span className="w-2 h-2 rounded-full bg-good" /> Excellent (80–100)
                </span>
                <span className="flex items-center gap-1.5 text-brand-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-brand-500" /> Good (60–79)
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-warn font-semibold">
                  <span className="w-2 h-2 rounded-full bg-warn" /> Fair (40–59)
                </span>
                <span className="flex items-center gap-1.5 text-bad font-semibold">
                  <span className="w-2 h-2 rounded-full bg-bad" /> Poor (0–39)
                </span>
              </div>
            </div>
          </div>

          {/* 6 Component Breakdown Cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-heading font-bold text-ink">
                The 6 Parts of Your Score
              </h3>
              <HelpTooltip
                title="6 Score Pillars"
                text="We divide your financial life into 6 areas. Savings and emergency cash have the biggest weights."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(scoreData.components || {}).map(([key, comp]) => {
                const Icon = componentIcons[key] || ShieldCheck;
                const name = componentNames[key] || key;
                const tooltipText = componentTooltips[key] || '';

                let badgeColor = 'text-good bg-good-bg';
                if (comp.score < 40) badgeColor = 'text-bad bg-bad-bg';
                else if (comp.score < 60) badgeColor = 'text-warn bg-warn-bg';
                else if (comp.score < 80) badgeColor = 'text-brand-600 bg-brand-50';

                return (
                  <div
                    key={key}
                    className="p-5 rounded-2xl bg-white border border-brand-100 shadow-card hover:shadow-hover transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <CornerDecor variant="dots" position="top-right" opacity={0.15} />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-heading font-bold text-sm text-ink">{name}</h4>
                              <HelpTooltip title={name} text={tooltipText} />
                            </div>
                            <span className="text-[10px] text-muted">Weight: {comp.weight}% of score</span>
                          </div>
                        </div>
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                          {comp.score}/100
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-brand-50 overflow-hidden mb-3">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-700"
                          style={{ width: `${comp.score}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs mb-3 text-muted">
                        <span>Current Value:</span>
                        <span className="font-bold text-ink">
                          {comp.rawValue} {comp.unit || ''}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-100 text-xs text-muted leading-relaxed relative z-10">
                      💡 {comp.tip}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Score Trend Chart */}
          {history.length > 1 && (
            <div className="p-6 rounded-3xl bg-white border border-brand-100 shadow-card">
              <h4 className="text-sm font-heading font-bold text-ink mb-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <span>How your score has changed over time</span>
              </h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5B9FD6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#5B9FD6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5EEF6" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDate(d)}
                      stroke="#6B7F92"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis domain={[0, 100]} stroke="#6B7F92" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`${val} / 100`, 'Health Score']}
                      labelFormatter={(l) => formatDate(l)}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: '#DCEBF8',
                        fontSize: 12,
                        boxShadow: '0 4px 16px rgba(30, 50, 70, 0.08)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#5B9FD6"
                      strokeWidth={2.5}
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
      <WhyPanel isOpen={whyOpen} onClose={() => setWhyOpen(false)} />
    </PageWrapper>
  );
}
