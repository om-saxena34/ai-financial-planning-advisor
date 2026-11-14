const Recommendation = require('../models/Recommendation');
const FinancialProfile = require('../models/FinancialProfile');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const mlClient = require('./mlClient.service');
const ApiError = require('../utils/ApiError');
const { logger } = require('../utils/logger');

/**
 * AI Recommendation Engine
 * Evaluates 10 deterministic financial heuristics informed by
 * behavioral classification from the ML microservice.
 */
class RecommendationService {
  /**
   * Generate or refresh recommendations for a user
   */
  async generateRecommendations(userId) {
    const profile = await FinancialProfile.findOne({ userId });
    if (!profile) {
      throw ApiError.notFound('Financial profile not found');
    }

    const income = profile.monthlyIncome || 50000;
    const fixedExpenses = profile.fixedExpenses || 20000;
    const savings = profile.existingSavings || 0;
    const investments = profile.existingInvestments || 0;

    // Fetch transactions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTx = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    });

    let totalExpenseSum = 0;
    let foodExpense = 0;
    let entertainmentExpense = 0;
    let shoppingExpense = 0;
    let emiExpense = 0;

    recentTx.forEach((tx) => {
      if (tx.type === 'expense') {
        totalExpenseSum += tx.amount;
        if (tx.category === 'Food') foodExpense += tx.amount;
        if (tx.category === 'Entertainment') entertainmentExpense += tx.amount;
        if (tx.category === 'Shopping') shoppingExpense += tx.amount;
        if (tx.category === 'EMI/Debt') emiExpense += tx.amount;
      }
    });

    const totalExpenses =
      totalExpenseSum > 0 ? totalExpenseSum : Math.max(fixedExpenses, income * 0.6);
    const discretionaryExpense =
      totalExpenseSum > 0
        ? entertainmentExpense + shoppingExpense
        : Math.max(0, totalExpenses - fixedExpenses);
    const savingsAmount = Math.max(0, income - totalExpenses);
    const savingsRate = savingsAmount / Math.max(1, income);
    const dti = emiExpense / Math.max(1, income);

    // Get active goals
    const goals = await Goal.find({ userId, status: 'in_progress' });

    // Get ML classification (with resilient fallback)
    let classification = { predicted_class: 'Balanced' };
    try {
      classification = await mlClient.classify({
        age: profile.age || 26,
        monthly_income: income,
        total_expenses: totalExpenses,
        savings_rate: savingsRate,
        essential_expense_ratio: fixedExpenses / Math.max(1, totalExpenses),
        discretionary_expense_ratio: discretionaryExpense / Math.max(1, totalExpenses),
        food_ratio: foodExpense / Math.max(1, totalExpenses),
        entertainment_ratio: entertainmentExpense / Math.max(1, totalExpenses),
        shopping_ratio: shoppingExpense / Math.max(1, totalExpenses),
        debt_to_income: dti,
        emergency_fund_months: savings / Math.max(1, totalExpenses),
        investment_ratio: investments / Math.max(1, income * 12),
        dependents: profile.dependents || 0,
        risk_profile: profile.riskProfile === 'conservative' ? 0 : profile.riskProfile === 'aggressive' ? 2 : 1,
      });
    } catch (err) {
      logger.warn(`Could not fetch ML classification for recommendations: ${err.message}`);
    }

    const candidateRecommendations = [];

    // ── Rule 1: Emergency Fund Cushion ─────────────────────────────
    const targetEmergencyFund = fixedExpenses * 3;
    if (savings < targetEmergencyFund) {
      const shortfall = Math.round(targetEmergencyFund - savings);
      candidateRecommendations.push({
        ruleId: 'RULE_EMERGENCY_FUND_LOW',
        title: 'Build Emergency Cushion',
        text: `Your liquid savings (₹${savings.toLocaleString('en-IN')}) cover less than 3 months of fixed expenses. Aim to accumulate ₹${shortfall.toLocaleString('en-IN')} in a high-yield savings account or liquid mutual fund.`,
        category: 'emergency_fund',
        priority: 'high',
        reasoning: `Emergency reserves are below the recommended 3-month safety threshold of ₹${targetEmergencyFund.toLocaleString('en-IN')}.`,
        potentialMonthlyImpact: Math.round(shortfall / 6),
      });
    }

    // ── Rule 2: High Discretionary Spending ────────────────────────
    const discretionaryRatio = discretionaryExpense / Math.max(1, totalExpenses);
    if (discretionaryRatio > 0.35 || discretionaryExpense > income * 0.35) {
      const trimAmount = Math.round(discretionaryExpense * 0.15);
      candidateRecommendations.push({
        ruleId: 'RULE_HIGH_DISCRETIONARY',
        title: 'Optimize Discretionary Spending',
        text: `Discretionary expenses account for ${(discretionaryRatio * 100).toFixed(1)}% of your outgo. Trimming leisure and shopping by 15% will free up ₹${trimAmount.toLocaleString('en-IN')}/month for wealth creation.`,
        category: 'budgeting',
        priority: classification.predicted_class === 'Overspender' ? 'high' : 'medium',
        reasoning: 'Non-essential outlays exceed 35% of total expense distribution.',
        potentialMonthlyImpact: trimAmount,
      });
    }

    // ── Rule 3: High Debt-to-Income ───────────────────────────────
    if (dti > 0.35) {
      candidateRecommendations.push({
        ruleId: 'RULE_HIGH_DEBT_RATIO',
        title: 'Accelerate Debt Reduction',
        text: `Debt repayments consume ${(dti * 100).toFixed(1)}% of your monthly earnings. Prioritize paying off high-interest debt using the Avalanche strategy to minimize interest erosion.`,
        category: 'debt',
        priority: 'high',
        reasoning: 'Debt-to-Income ratio exceeds the prudent 35% ceiling.',
        potentialMonthlyImpact: Math.round(emiExpense * 0.2),
      });
    }

    // ── Rule 4: Idle Cash / Low Investment Exposure ───────────────
    if (savings >= fixedExpenses * 6 && investments < income * 2) {
      const suggestedSip = Math.round(income * 0.15);
      candidateRecommendations.push({
        ruleId: 'RULE_LOW_INVESTMENTS_HIGH_SAVINGS',
        title: 'Deploy Idle Savings into SIP',
        text: `You have over 6 months of emergency reserves! Rather than holding excess cash in low-interest accounts, start an equity/index SIP of ₹${suggestedSip.toLocaleString('en-IN')}/month to beat inflation.`,
        category: 'investment',
        priority: 'medium',
        reasoning: 'Substantial liquid buffer exists, but long-term wealth compounding is under-utilized.',
        potentialMonthlyImpact: suggestedSip,
      });
    }

    // ── Rule 5: ML Behavioral Diagnosis (Overspender Alert) ────────
    if (classification.predicted_class === 'Overspender') {
      candidateRecommendations.push({
        ruleId: 'RULE_ML_OVERSPENDER_ALERT',
        title: 'Reset to 50/30/20 Budgeting Rule',
        text: `FinWise AI classified your spending velocity as 'Overspender'. Realign your finances to the 50/30/20 framework: 50% Needs, 30% Wants, and 20% Automated Savings on payday.`,
        category: 'budgeting',
        priority: 'high',
        reasoning: 'Machine learning model detected behavioral markers consistent with high-burn spending patterns.',
        potentialMonthlyImpact: Math.round(income * 0.2),
      });
    }

    // ── Rule 6: Goals Lagging Behind Schedule ──────────────────────
    const laggingGoals = goals.filter((g) => !g.feasibility?.isOnTrack && g.feasibility?.shortfall > 0);
    if (laggingGoals.length > 0) {
      const topLagging = laggingGoals[0];
      candidateRecommendations.push({
        ruleId: `RULE_GOAL_LAG_${topLagging._id}`,
        title: `Goal "${topLagging.title}" Needs Attention`,
        text: `Your current savings rate is insufficient to hit "${topLagging.title}" by ${new Date(topLagging.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}. Consider boosting your monthly contribution by ₹${(topLagging.feasibility.shortfall || 1000).toLocaleString('en-IN')}.`,
        category: 'goals',
        priority: 'high',
        reasoning: 'Calculated monthly required SIP exceeds estimated unallocated surplus cash flow.',
        potentialMonthlyImpact: topLagging.feasibility.shortfall || 1000,
      });
    }

    // ── Rule 7: Low Savings Rate ──────────────────────────────────
    if (savingsRate < 0.15) {
      const targetSavings = Math.round(income * 0.2);
      candidateRecommendations.push({
        ruleId: 'RULE_LOW_SAVINGS_RATE',
        title: 'Automate a 20% Payday Transfer',
        text: `Your monthly savings rate is currently ${(savingsRate * 100).toFixed(1)}%. Setting up an auto-debit of ₹${targetSavings.toLocaleString('en-IN')} right after salary day ensures you pay yourself first.`,
        category: 'savings',
        priority: 'high',
        reasoning: 'Current savings rate is under the foundational 15% threshold for long-term security.',
        potentialMonthlyImpact: targetSavings,
      });
    }

    // ── Rule 8: High Food / Dining Ratio ──────────────────────────
    if (foodExpense > totalExpenses * 0.25 && foodExpense > 5000) {
      const potentialDiningSavings = Math.round(foodExpense * 0.2);
      candidateRecommendations.push({
        ruleId: 'RULE_HIGH_FOOD_EXPENSES',
        title: 'Cook at Home Two Extra Nights',
        text: `Food and dining accounts for ${((foodExpense / totalExpenses) * 100).toFixed(1)}% of your expenses (₹${foodExpense.toLocaleString('en-IN')}). Meal planning and prepping at home twice a week can save ₹${potentialDiningSavings.toLocaleString('en-IN')}/month.`,
        category: 'budgeting',
        priority: 'medium',
        reasoning: 'Food expenditures exceed 25% of monthly total expenses.',
        potentialMonthlyImpact: potentialDiningSavings,
      });
    }

    // ── Rule 9: Conservative Investor with Long Horizon ───────────
    if (profile.riskProfile === 'conservative' && goals.some((g) => new Date(g.targetDate).getFullYear() - new Date().getFullYear() >= 5)) {
      candidateRecommendations.push({
        ruleId: 'RULE_LONG_HORIZON_EQUITY',
        title: 'Consider Index Mutual Funds for Long Goals',
        text: `You have goals set 5+ years into the future with conservative settings. Incorporating 20–30% broad-market index funds (e.g. Nifty 50) safeguards your capital against inflation erosion.`,
        category: 'investment',
        priority: 'medium',
        reasoning: 'Inflation at ~6% significantly diminishes the purchasing power of fixed deposits over 5+ year horizons.',
        potentialMonthlyImpact: 0,
      });
    }

    // ── Rule 10: Surplus Cash Without Active Goals ────────────────
    const committedGoalSIP = goals.reduce((sum, g) => sum + (g.requiredMonthlySIP || 0), 0);
    const unallocatedSurplus = savingsAmount - committedGoalSIP;
    if (unallocatedSurplus > 5000 && goals.length === 0) {
      candidateRecommendations.push({
        ruleId: 'RULE_SURPLUS_WITHOUT_GOALS',
        title: 'Give Your Surplus Cash a Purpose',
        text: `You have ₹${Math.round(unallocatedSurplus).toLocaleString('en-IN')}/month in unallocated surplus. Defining targeted goals (e.g., Higher Education, Down Payment, Travel) accelerates your financial focus.`,
        category: 'goals',
        priority: 'low',
        reasoning: 'Positive monthly cash surplus detected with zero active financial goals registered.',
        potentialMonthlyImpact: Math.round(unallocatedSurplus),
      });
    }

    // Upsert recommendations into database so user preferences (dismissed/applied) are preserved
    for (const rec of candidateRecommendations) {
      const existing = await Recommendation.findOne({ userId, ruleId: rec.ruleId });
      if (!existing) {
        await Recommendation.create({
          userId,
          ...rec,
          status: 'new',
        });
      }
    }

    // Return active recommendations sorted by priority (high > medium > low)
    const priorityWeight = { high: 1, medium: 2, low: 3 };
    const allRecs = await Recommendation.find({
      userId,
      status: { $ne: 'dismissed' },
    }).lean();

    allRecs.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
    return allRecs;
  }

  /**
   * Update recommendation status (seen, applied, dismissed)
   */
  async updateStatus(userId, recommendationId, status) {
    const rec = await Recommendation.findOne({ _id: recommendationId, userId });
    if (!rec) {
      throw ApiError.notFound('Recommendation not found');
    }

    rec.status = status;
    await rec.save();
    return rec;
  }
}

module.exports = new RecommendationService();
