const Goal = require('../models/Goal');
const FinancialProfile = require('../models/FinancialProfile');
const { calculateRequiredSip } = require('../utils/financialMath');
const ApiError = require('../utils/ApiError');

/**
 * Service handling Goal CRUD, SIP mathematical solving,
 * and feasibility analysis against monthly income/fixed expenses.
 */
class GoalService {
  /**
   * Calculate required SIP and feasibility for a goal
   */
  async computeGoalMetrics(userId, goalData) {
    const targetAmount = Number(goalData.targetAmount);
    const currentAmount = Number(goalData.currentAmount || 0);
    const targetDate = new Date(goalData.targetDate);
    const expectedReturnRate = Number(goalData.expectedReturnRate ?? 10);
    const now = new Date();

    const diff = Math.max(0, targetAmount - currentAmount);
    const monthsRemaining = Math.max(
      1,
      Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4375))
    );
    const yearsRemaining = monthsRemaining / 12;

    const sipCalc = calculateRequiredSip({
      targetAmount: diff,
      annualRate: expectedReturnRate,
      years: yearsRemaining,
    });
    const requiredMonthlySIP = sipCalc.requiredMonthlySip;

    // Check user disposable capacity
    const profile = await FinancialProfile.findOne({ userId });
    const monthlyIncome = profile?.monthlyIncome || 50000;
    const fixedExpenses = profile?.fixedExpenses || 20000;
    const disposableIncome = Math.max(0, monthlyIncome - fixedExpenses);

    // Sum existing commitments from other active goals
    const existingGoals = await Goal.find({
      userId,
      status: 'in_progress',
      ...(goalData._id ? { _id: { $ne: goalData._id } } : {}),
    });
    const totalCommittedSIP = existingGoals.reduce(
      (sum, g) => sum + (g.requiredMonthlySIP || 0),
      0
    );

    const totalNeeded = totalCommittedSIP + requiredMonthlySIP;
    const isOnTrack = totalNeeded <= disposableIncome;
    const shortfall = isOnTrack ? 0 : Math.round(totalNeeded - disposableIncome);

    return {
      requiredMonthlySIP,
      monthsRemaining,
      feasibility: {
        isOnTrack,
        shortfall,
        recommendedSIP: requiredMonthlySIP,
      },
    };
  }

  /**
   * Create new goal
   */
  async createGoal(userId, data) {
    const metrics = await this.computeGoalMetrics(userId, data);

    const goal = await Goal.create({
      ...data,
      userId,
      requiredMonthlySIP: metrics.requiredMonthlySIP,
      feasibility: metrics.feasibility,
      status: data.currentAmount >= data.targetAmount ? 'completed' : 'in_progress',
    });

    return goal;
  }

  /**
   * Get all goals for a user
   */
  async getGoals(userId, query = {}) {
    const filter = { userId };
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.priority) filter.priority = query.priority;

    const goals = await Goal.find(filter).sort({ targetDate: 1 }).lean();

    return goals.map((goal) => {
      const progressPercent = Math.min(
        100,
        Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100)
      );
      return {
        ...goal,
        progressPercent,
      };
    });
  }

  /**
   * Get goal by ID
   */
  async getGoalById(userId, goalId) {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }

    const progressPercent = Math.min(
      100,
      Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100)
    );

    return {
      ...goal.toObject(),
      progressPercent,
    };
  }

  /**
   * Update goal
   */
  async updateGoal(userId, goalId, updateData) {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }

    const merged = { ...goal.toObject(), ...updateData };
    const metrics = await this.computeGoalMetrics(userId, merged);

    Object.assign(goal, updateData, {
      requiredMonthlySIP: metrics.requiredMonthlySIP,
      feasibility: metrics.feasibility,
    });

    if (goal.currentAmount >= goal.targetAmount && goal.status !== 'completed') {
      goal.status = 'completed';
    }

    await goal.save();
    return goal;
  }

  /**
   * Contribute funds towards a goal
   */
  async contribute(userId, goalId, amount) {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }

    goal.currentAmount += Number(amount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    const metrics = await this.computeGoalMetrics(userId, goal.toObject());
    goal.requiredMonthlySIP = metrics.requiredMonthlySIP;
    goal.feasibility = metrics.feasibility;

    await goal.save();
    return goal;
  }

  /**
   * Delete goal
   */
  async deleteGoal(userId, goalId) {
    const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }
    return { success: true, message: 'Goal deleted successfully' };
  }
}

module.exports = new GoalService();
