import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { recommendationService } from '../services/recommendation.service';
import {
  Sparkles,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Wallet,
  PiggyBank,
  BadgeAlert,
  Target,
  ArrowUpRight,
} from 'lucide-react';

const CATEGORY_ICONS = {
  savings: PiggyBank,
  budgeting: Wallet,
  investment: TrendingUp,
  debt: BadgeAlert,
  emergency_fund: ShieldAlert,
  goals: Target,
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationService.getRecommendations();
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await recommendationService.getRecommendations();
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed to refresh recommendations', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await recommendationService.updateStatus(id, status);
      setRecommendations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (r.status === 'dismissed') return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    return true;
  });

  const totalMonthlyImpact = filteredRecs.reduce(
    (sum, r) => sum + (r.potentialMonthlyImpact || 0),
    0
  );

  return (
    <PageWrapper title="AI Recommendations">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            AI Recommendation Engine
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Personalized, explainable financial directives synthesized from 10 heuristic rules and ML behavior classification.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 font-semibold text-sm rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Evaluating Rules...' : 'Re-evaluate Advice'}
        </button>
      </div>

      {/* Top Banner KPI */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white mb-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">
              Estimated Monthly Wealth Opportunity
            </div>
            <div className="text-3xl font-extrabold">
              ₹{totalMonthlyImpact.toLocaleString('en-IN')}
              <span className="text-sm font-normal text-indigo-200 ml-2">/ month in unlocked value</span>
            </div>
            <p className="text-xs text-indigo-100 mt-2 max-w-xl">
              Applying these recommendations addresses liquidity risk, trims discretionary leaks, and directs capital into compounding assets.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20 text-center">
            <div className="text-xs text-indigo-200">Active Directives</div>
            <div className="text-2xl font-bold">{filteredRecs.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'budgeting', 'savings', 'emergency_fund', 'investment', 'debt', 'goals'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md capitalize transition-colors ${
                priorityFilter === p
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Evaluating recommendation heuristics...</div>
      ) : filteredRecs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            All Recommendations Handled
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Your financial profile and current spending habits are aligned with key financial benchmarks!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => {
            const Icon = CATEGORY_ICONS[rec.category] || Sparkles;
            const isApplied = rec.status === 'applied';

            return (
              <div
                key={rec._id}
                className={`bg-white dark:bg-gray-900 border rounded-2xl p-6 transition-all shadow-sm hover:shadow-md ${
                  isApplied
                    ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            rec.priority === 'high'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                              : rec.priority === 'medium'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {rec.category.replace('_', ' ')}
                        </span>
                        {isApplied && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Applied
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        {rec.text}
                      </p>

                      {/* Explainability Box (Viva Feature) */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            Explainable Reason:{' '}
                          </span>
                          {rec.reasoning}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Impact */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-800">
                    {rec.potentialMonthlyImpact > 0 && (
                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 block">Est. Impact</span>
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          +₹{rec.potentialMonthlyImpact.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {!isApplied ? (
                        <button
                          onClick={() => handleStatusChange(rec._id, 'applied')}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(rec._id, 'seen')}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg"
                        >
                          Undo
                        </button>
                      )}

                      <button
                        onClick={() => handleStatusChange(rec._id, 'dismissed')}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Dismiss recommendation"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Educational Viva Card */}
      <div className="mt-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Viva Concept: How the AI Recommendation Engine Operates
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          The recommendation engine bridges pure financial planning mathematics with machine learning:
          ten quantitative heuristics (such as 3-month emergency cushion, debt-to-income threshold &gt;35%, discretionary spending ceiling &gt;35%, and SIP shortfall) evaluate user telemetry. The user's ML behavioral cluster (Saver, Balanced, or Overspender) dynamically sets recommendation urgency, ensuring aggressive budget corrections appear first for overspenders while investment optimization leads for disciplined savers.
        </p>
      </div>
    </PageWrapper>
  );
}
