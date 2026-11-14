import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { goalService } from '../services/goal.service';
import {
  Target,
  Plus,
  TrendingUp,
  ShieldAlert,
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
  emergency_fund: 'Emergency Fund',
  education: 'Higher Education',
  travel: 'Travel & Vacation',
  car: 'Vehicle Purchase',
  house: 'Home Down Payment',
  retirement: 'Retirement Corpus',
  wedding: 'Wedding & Life Events',
  custom: 'Custom Goal',
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
      setError(err.response?.data?.message || 'Failed to load goals');
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
      alert(err.response?.data?.message || 'Failed to create goal');
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
      alert(err.response?.data?.message || 'Failed to contribute');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goalService.deleteGoal(id);
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete goal');
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
    <PageWrapper title="Goal-Based Financial Planning">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Financial Goals & SIP Planning
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track milestones with auto-calculated SIP requirements and real-time feasibility analysis.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Active Goals
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {goals.filter((g) => g.status === 'in_progress').length}
            <span className="text-xs text-gray-400 font-normal ml-2">/ {goals.length} total</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Total Target Corpus
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{totalTarget.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Accumulated Wealth
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{totalSaved.toLocaleString('en-IN')}
            <span className="text-xs text-gray-400 font-normal ml-2">({overallProgress}%)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Total Required SIP
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            ₹{totalMonthlySipNeeded.toLocaleString('en-IN')}
            <span className="text-xs text-gray-400 font-normal ml-1">/mo</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'in_progress', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading financial goals...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-12 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No goals found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Setting clear financial targets is the first step toward long-term wealth building.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm"
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
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Status bar header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        {GOAL_TYPE_ICONS[goal.type] || '🎯'}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                          {goal.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {GOAL_TYPE_LABELS[goal.type] || 'Goal'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        goal.priority === 'high'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                          : goal.priority === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                      }`}
                    >
                      {goal.priority}
                    </span>
                  </div>

                  {/* Amounts & Progress */}
                  <div className="mt-4 mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-gray-500">Current Saved</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Target: ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                      ₹{(goal.currentAmount || 0).toLocaleString('en-IN')}
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-2">
                        ({goal.progressPercent}%)
                      </span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Mathematical SIP solving box */}
                  {!isCompleted && (
                    <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Required Monthly SIP
                        </span>
                        <span className="font-bold text-indigo-900 dark:text-indigo-200">
                          ₹{(goal.requiredMonthlySIP || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {monthsLeft} months remaining
                        </span>
                        <span>Assumed return: {goal.expectedReturnRate}%</span>
                      </div>
                    </div>
                  )}

                  {/* Feasibility Indicator */}
                  {!isCompleted && goal.feasibility && (
                    <div
                      className={`text-xs p-2 rounded-lg flex items-center gap-2 mb-4 ${
                        goal.feasibility.isOnTrack
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
                      }`}
                    >
                      {goal.feasibility.isOnTrack ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>On track within current monthly disposable income.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            Shortfall of ₹{goal.feasibility.shortfall.toLocaleString('en-IN')}/mo to hit target date.
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="text-xs p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                      <span className="font-semibold">Goal Achieved! Congratulations!</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
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
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors"
                      >
                        + Contribute
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
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

      {/* ── CREATE GOAL MODAL ─────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Create New Financial Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master's in CS, Emergency Cushion"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Goal Type
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none"
                  >
                    {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="500000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Initial Savings (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newGoal.expectedReturnRate}
                    onChange={(e) => setNewGoal({ ...newGoal, expectedReturnRate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  {formSubmitting ? 'Calculating...' : 'Save & Calculate SIP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CONTRIBUTE MODAL ─────────────────────────────────────── */}
      {showContributeModal && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              Contribute to "{activeGoal.title}"
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Current progress: ₹{(activeGoal.currentAmount || 0).toLocaleString('en-IN')} of ₹{activeGoal.targetAmount.toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Amount to add (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="e.g. 5000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContributeModal(false);
                    setActiveGoal(null);
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  {formSubmitting ? 'Saving...' : 'Confirm Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
