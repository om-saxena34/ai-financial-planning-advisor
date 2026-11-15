import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { goalService } from '../services/goal.service';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Trash2,
  Coins,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const GOAL_TYPE_ICONS = {
  emergency_fund: '🛡️',
  education: '🎓',
  travel: '✈️',
  car: '🚗',
  house: '🏠',
  retirement: '🏖️',
  wedding: '💍',
  custom: '🎯',
};

const GOAL_TYPE_LABELS = {
  emergency_fund: 'Emergency fund',
  education: 'College or studies',
  travel: 'Trip or holiday',
  car: 'New vehicle',
  house: 'House down-payment',
  retirement: 'Retirement fund',
  wedding: 'Wedding celebration',
  custom: 'Personal dream',
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // New goal form
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'custom',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    expectedReturnRate: 10,
    priority: 'medium',
  });

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await goalService.getGoals();
      setGoals(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      await goalService.createGoal({
        ...newGoal,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount || 0),
        expectedReturnRate: Number(newGoal.expectedReturnRate),
      });
      setShowCreateModal(false);
      setNewGoal({
        title: '',
        type: 'custom',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        expectedReturnRate: 10,
        priority: 'medium',
      });
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create goal.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!activeGoal || !contributionAmount) return;
    try {
      setFormSubmitting(true);
      await goalService.contributeToGoal(activeGoal._id, Number(contributionAmount));
      setShowContributeModal(false);
      setContributionAmount('');
      setActiveGoal(null);
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add money to this goal.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to remove this goal?')) return;
    try {
      await goalService.deleteGoal(id);
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete goal.');
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === 'in_progress') return g.status === 'in_progress';
    if (filter === 'completed') return g.status === 'completed';
    return true;
  });

  // KPI calculations
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const totalMonthlySipNeeded = goals
    .filter((g) => g.status === 'in_progress')
    .reduce((sum, g) => sum + (g.requiredMonthlySIP || 0), 0);

  return (
    <PageWrapper title="Your Savings Goals">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] flex items-center gap-2">
            <Target className="w-7 h-7 text-[var(--blue-500)]" />
            Your Savings Goals
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Pick what you want to save for. We will show you how much to save every month.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white font-medium text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add a New Goal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 relative overflow-hidden shadow-xs">
          <CornerDecor variant="dots" position="top-right" size={50} opacity={0.35} />
          <div className="flex items-center justify-between text-[var(--muted)] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Goals</span>
            <Target className="w-4 h-4 text-[var(--blue-500)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--ink)]">
            <AnimatedNumber value={goals.filter((g) => g.status === 'in_progress').length} />
            <span className="text-xs text-[var(--muted)] font-normal ml-2">/ {goals.length} total</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 relative overflow-hidden shadow-xs">
          <CornerDecor variant="arc" position="top-right" size={45} opacity={0.35} />
          <div className="flex items-center justify-between text-[var(--muted)] text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              Total Goal Amount
              <HelpTooltip term="Total Goal" text="The total money you need across all your goals." />
            </span>
            <Coins className="w-4 h-4 text-[var(--good)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--ink)]">
            <AnimatedNumber value={totalTarget} prefix="₹" />
          </div>
        </div>

        <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 relative overflow-hidden shadow-xs">
          <CornerDecor variant="dots" position="top-right" size={50} opacity={0.35} />
          <div className="flex items-center justify-between text-[var(--muted)] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Money Saved So Far</span>
            <TrendingUp className="w-4 h-4 text-[var(--blue-500)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--good)]">
            <AnimatedNumber value={totalSaved} prefix="₹" />
            <span className="text-xs text-[var(--muted)] font-normal ml-2">({overallProgress}%)</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-5 relative overflow-hidden shadow-xs">
          <CornerDecor variant="arc" position="top-right" size={45} opacity={0.35} />
          <div className="flex items-center justify-between text-[var(--muted)] text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              Needed Every Month
              <HelpTooltip term="Monthly SIP" text="How much you should save every month to finish on time." />
            </span>
            <Sparkles className="w-4 h-4 text-[var(--warn)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--blue-700)]">
            <AnimatedNumber value={totalMonthlySipNeeded} prefix="₹" />
            <span className="text-xs text-[var(--muted)] font-normal ml-1">/mo</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: 'all', label: 'All goals' },
          { key: 'in_progress', label: 'In progress' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-[var(--blue-500)] text-white shadow-xs'
                : 'bg-white text-[var(--muted)] border border-[var(--blue-100)] hover:bg-[var(--blue-50)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-[var(--muted)]">Loading your goals...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white border border-dashed border-[var(--blue-100)] rounded-2xl p-12 text-center relative overflow-hidden">
          <CornerDecor variant="blob" position="bottom-right" size={100} opacity={0.4} />
          <Target className="w-12 h-12 text-[var(--blue-300)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--ink)] mb-1">
            No goals yet
          </h3>
          <p className="text-sm text-[var(--muted)] mb-6 max-w-sm mx-auto">
            Setting a clear target is the easiest way to start saving money with purpose.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white text-sm font-medium rounded-xl shadow-xs transition-all"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const monthsLeft = Math.max(
              1,
              Math.round((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30.4375))
            );
            const isCompleted = goal.status === 'completed';

            return (
              <div
                key={goal._id}
                className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <CornerDecor variant="arc" position="top-right" size={40} opacity={0.3} />

                {/* Status bar header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-[var(--blue-50)] rounded-xl border border-[var(--blue-100)]">
                        {GOAL_TYPE_ICONS[goal.type] || '🎯'}
                      </span>
                      <div>
                        <h3 className="font-bold text-[var(--ink)] text-base leading-snug">
                          {goal.title}
                        </h3>
                        <span className="text-xs text-[var(--muted)]">
                          {GOAL_TYPE_LABELS[goal.type] || 'Goal'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        goal.priority === 'high'
                          ? 'bg-rose-50 text-[var(--bad)] border border-rose-200'
                          : goal.priority === 'medium'
                          ? 'bg-amber-50 text-[var(--warn)] border border-amber-200'
                          : 'bg-[var(--blue-50)] text-[var(--blue-700)] border border-[var(--blue-100)]'
                      }`}
                    >
                      {goal.priority}
                    </span>
                  </div>

                  {/* Amounts & Progress */}
                  <div className="mt-4 mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-[var(--muted)]">Saved</span>
                      <span className="text-xs font-semibold text-[var(--ink)]">
                        Target: ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-[var(--ink)] mb-2">
                      ₹{(goal.currentAmount || 0).toLocaleString('en-IN')}
                      <span className="text-xs font-medium text-[var(--good)] ml-2">
                        ({goal.progressPercent}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-[var(--blue-50)] rounded-full overflow-hidden border border-[var(--blue-100)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-[var(--good)]' : 'bg-[var(--blue-500)]'
                        }`}
                        style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Monthly SIP Box */}
                  {!isCompleted && (
                    <div className="p-3 bg-[var(--blue-50)] rounded-xl border border-[var(--blue-100)] mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--blue-700)] font-medium flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Needed Every Month
                        </span>
                        <span className="font-bold text-[var(--ink)]">
                          ₹{(goal.requiredMonthlySIP || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {monthsLeft} months left
                        </span>
                        <span>Expected yearly return: {goal.expectedReturnRate}%</span>
                      </div>
                    </div>
                  )}

                  {/* Feasibility Indicator */}
                  {!isCompleted && goal.feasibility && (
                    <div
                      className={`text-xs p-2.5 rounded-lg flex items-center gap-2 mb-4 ${
                        goal.feasibility.isOnTrack
                          ? 'bg-emerald-50 text-[var(--good)] border border-emerald-200'
                          : 'bg-amber-50 text-[var(--warn)] border border-amber-200'
                      }`}
                    >
                      {goal.feasibility.isOnTrack ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>You can easily afford this from your regular savings!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            You need ₹{goal.feasibility.shortfall.toLocaleString('en-IN')} more each month to reach this in time.
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="text-xs p-2.5 rounded-xl bg-emerald-50 text-[var(--good)] border border-emerald-200 flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">Goal achieved! Well done!</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[var(--blue-100)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Target: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          setActiveGoal(goal);
                          setShowContributeModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-[var(--blue-50)] text-[var(--blue-700)] hover:bg-[var(--blue-100)] border border-[var(--blue-100)] rounded-lg transition-colors"
                      >
                        + Add Money
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1.5 text-[var(--muted)] hover:text-[var(--bad)] rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[var(--blue-100)] relative overflow-hidden">
            <CornerDecor variant="blob" position="top-right" size={80} opacity={0.3} />
            <h3 className="text-lg font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--blue-500)]" />
              Add a New Savings Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  What are you saving for? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master's Degree, Laptop, Rainy day fund"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl focus:border-[var(--blue-500)] outline-none text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Goal Type
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl outline-none text-[var(--ink)]"
                  >
                    {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Priority
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl outline-none text-[var(--ink)]"
                  >
                    <option value="high">High priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Total amount needed (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="50000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl focus:border-[var(--blue-500)] outline-none text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Starting money saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl focus:border-[var(--blue-500)] outline-none text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl focus:border-[var(--blue-500)] outline-none text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Expected yearly return (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newGoal.expectedReturnRate}
                    onChange={(e) => setNewGoal({ ...newGoal, expectedReturnRate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl focus:border-[var(--blue-500)] outline-none text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--blue-100)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--blue-50)] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white rounded-xl shadow-xs transition-colors"
                >
                  {formSubmitting ? 'Calculating...' : 'Save & Calculate Monthly SIP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTRIBUTE MODAL */}
      {showContributeModal && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[var(--blue-100)] relative overflow-hidden">
            <CornerDecor variant="dots" position="top-right" size={60} opacity={0.3} />
            <h3 className="text-base font-bold text-[var(--ink)] mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[var(--good)]" />
              Add Money to "{activeGoal.title}"
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Saved so far: ₹{(activeGoal.currentAmount || 0).toLocaleString('en-IN')} of ₹{activeGoal.targetAmount.toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  How much are you adding today? (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="e.g. 5000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-semibold text-[var(--good)] bg-[var(--bg)] border border-[var(--blue-100)] rounded-xl focus:border-[var(--good)] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--blue-100)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowContributeModal(false);
                    setActiveGoal(null);
                  }}
                  className="px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--blue-50)] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-[var(--good)] hover:opacity-90 text-white rounded-xl shadow-xs transition-opacity"
                >
                  {formSubmitting ? 'Saving...' : 'Add to Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
