import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { recommendationService } from '../services/recommendation.service';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
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

const CATEGORY_LABELS = {
  all: 'All tips',
  budgeting: 'Day-to-day spending',
  savings: 'Saving money',
  emergency_fund: 'Emergency cushion',
  investment: 'Growing your money',
  debt: 'Loans & cards',
  goals: 'Your goals',
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
      alert(err.response?.data?.message || 'Failed to update tip status.');
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
    <PageWrapper title="Smart Money Tips">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[var(--blue-500)]" />
            Smart Money Tips For You
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Tips picked just for you to help you save more, cut costs, and reach your goals faster.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[var(--blue-700)] hover:bg-[var(--blue-50)] border border-[var(--blue-100)] font-semibold text-sm rounded-xl shadow-xs transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--blue-500)] ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Checking your numbers...' : 'Refresh My Tips'}
        </button>
      </div>

      {/* Top Banner KPI */}
      <div className="bg-gradient-to-r from-[var(--blue-700)] to-[var(--blue-500)] rounded-2xl p-6 text-white mb-8 shadow-sm relative overflow-hidden">
        <CornerDecor variant="arc" position="top-right" size={90} opacity={0.25} />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-100 mb-1 flex items-center gap-1.5">
              <span>Money You Could Save Every Month</span>
              <HelpTooltip term="Monthly Savings" text="How much extra money you could keep each month if you follow these tips." />
            </div>
            <div className="text-3xl font-extrabold flex items-baseline">
              <AnimatedNumber value={totalMonthlyImpact} prefix="₹" />
              <span className="text-sm font-normal text-blue-100 ml-2">every month back in your pocket</span>
            </div>
            <p className="text-xs text-blue-50 mt-2 max-w-xl leading-relaxed">
              Following these tips helps you build emergency savings, stop money leaks, and grow your wealth with smart investing.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-xl border border-white/20 text-center">
            <div className="text-xs text-blue-100">Tips for You</div>
            <div className="text-2xl font-bold">{filteredRecs.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                categoryFilter === cat
                  ? 'bg-[var(--blue-500)] text-white shadow-xs'
                  : 'bg-white text-[var(--muted)] border border-[var(--blue-100)] hover:bg-[var(--blue-50)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-[var(--blue-100)] p-1 rounded-lg">
          {[
            { key: 'all', label: 'All' },
            { key: 'high', label: 'High' },
            { key: 'medium', label: 'Medium' },
            { key: 'low', label: 'Low' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPriorityFilter(p.key)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                priorityFilter === p.key
                  ? 'bg-[var(--blue-50)] text-[var(--blue-700)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="py-20 text-center text-[var(--muted)]">Checking what tips work best for you...</div>
      ) : filteredRecs.length === 0 ? (
        <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-12 text-center relative overflow-hidden">
          <CornerDecor variant="blob" position="bottom-right" size={100} opacity={0.3} />
          <CheckCircle2 className="w-12 h-12 text-[var(--good)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--ink)] mb-1">
            You are all caught up!
          </h3>
          <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
            Your spending and savings are right in line with healthy money habits. Keep it up!
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
                className={`bg-white border rounded-2xl p-6 transition-all shadow-xs hover:shadow-md relative overflow-hidden ${
                  isApplied
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-[var(--blue-100)]'
                }`}
              >
                <CornerDecor variant="dots" position="top-right" size={45} opacity={0.3} />

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-[var(--blue-50)] rounded-xl border border-[var(--blue-100)] flex-shrink-0 text-[var(--blue-700)]">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            rec.priority === 'high'
                              ? 'bg-rose-50 text-[var(--bad)] border border-rose-200'
                              : rec.priority === 'medium'
                              ? 'bg-amber-50 text-[var(--warn)] border border-amber-200'
                              : 'bg-[var(--blue-50)] text-[var(--blue-700)] border border-[var(--blue-100)]'
                          }`}
                        >
                          {rec.priority} priority
                        </span>
                        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                          {rec.category.replace('_', ' ')}
                        </span>
                        {isApplied && (
                          <span className="text-xs font-semibold text-[var(--good)] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[var(--ink)] mb-2">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-[var(--ink)] leading-relaxed mb-3">
                        {rec.text}
                      </p>

                      {/* Explainability Box (Viva Feature) */}
                      <div className="p-3 bg-[var(--blue-50)] rounded-xl border border-[var(--blue-100)] text-xs text-[var(--ink)] flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-[var(--blue-500)] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[var(--blue-700)]">
                            Why we suggest this:{' '}
                          </span>
                          {rec.reasoning}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Impact */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--blue-100)]">
                    {rec.potentialMonthlyImpact > 0 && (
                      <div className="text-right">
                        <span className="text-[11px] text-[var(--muted)] block">Est. Impact</span>
                        <span className="text-sm font-extrabold text-[var(--good)]">
                          +₹{rec.potentialMonthlyImpact.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {!isApplied ? (
                        <button
                          onClick={() => handleStatusChange(rec._id, 'applied')}
                          className="px-3 py-1.5 text-xs font-semibold bg-[var(--good)] hover:opacity-90 text-white rounded-lg shadow-xs transition-opacity flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Done
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(rec._id, 'seen')}
                          className="px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--blue-100)] rounded-lg bg-white"
                        >
                          Undo
                        </button>
                      )}

                      <button
                        onClick={() => handleStatusChange(rec._id, 'dismissed')}
                        className="p-1.5 text-[var(--muted)] hover:text-[var(--bad)] rounded-lg transition-colors"
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
      <div className="mt-12 bg-white border border-[var(--blue-100)] rounded-2xl p-6 relative overflow-hidden">
        <CornerDecor variant="arc" position="bottom-right" size={60} opacity={0.3} />
        <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[var(--blue-500)]" />
          How this engine works (for project viva):
        </h4>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          We combine 10 simple financial rules with our machine learning model. If you spend too much on eating out or shopping, it spots that first. If you are already saving well, it shows you how to invest and grow your money faster. Every single tip has a clear 'Why we suggest this' note so it is never a black box.
        </p>
      </div>
    </PageWrapper>
  );
}
