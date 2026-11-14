const FinancialProfile = require('../models/FinancialProfile');
const Transaction = require('../models/Transaction');
const PredictionLog = require('../models/PredictionLog');
const mlClient = require('./mlClient.service');
const ApiError = require('../utils/ApiError');
const { logger } = require('../utils/logger');

/**
 * Service to manage ML-driven classification and forecasting workflows,
 * feature extraction from user profiles/transactions, and audit logging.
 */
class PredictionService {
  /**
   * Extract features from user's FinancialProfile and recent transaction history.
   */
  async extractUserFeatures(userId) {
    const profile = await FinancialProfile.findOne({ userId });
    if (!profile) {
      throw ApiError.notFound(
        'Financial profile not found. Please complete onboarding first.'
      );
    }

    const income = profile.monthlyIncome || 50000;
    const fixedExpenses = profile.fixedExpenses || 20000;

    // Look back at the last 30 days of transactions for real behavioral patterns
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    });

    let totalExpenseSum = 0;
    let foodExpense = 0;
    let entertainmentExpense = 0;
    let shoppingExpense = 0;
    let emiExpense = 0;
    let investmentExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const amt = tx.amount;
        totalExpenseSum += amt;
        switch (tx.category) {
          case 'Food':
            foodExpense += amt;
            break;
          case 'Entertainment':
            entertainmentExpense += amt;
            break;
          case 'Shopping':
            shoppingExpense += amt;
            break;
          case 'EMI/Debt':
            emiExpense += amt;
            break;
          case 'Investments':
            investmentExpense += amt;
            break;
          default:
            break;
        }
      }
    });

    // If user has recorded transactions, use them; otherwise use profile baseline
    const total_expenses =
      totalExpenseSum > 0 ? totalExpenseSum : Math.max(fixedExpenses, income * 0.6);

    const essential_expenses =
      totalExpenseSum > 0
        ? totalExpenseSum - entertainmentExpense - shoppingExpense
        : fixedExpenses;

    const essential_ratio = Math.min(
      1.0,
      Math.max(0.05, essential_expenses / Math.max(1, total_expenses))
    );
    const discretionary_ratio = Math.max(0.0, 1.0 - essential_ratio);

    const savings_amount = Math.max(0, income - total_expenses);
    const savings_rate = Math.min(
      0.95,
      Math.max(0.0, savings_amount / Math.max(1, income))
    );

    const riskMap = { conservative: 0, moderate: 1, aggressive: 2 };
    const risk_profile = riskMap[profile.riskProfile] ?? 1;

    const expectedReturnMap = { 0: 8.0, 1: 11.0, 2: 14.0 };
    const expected_return_rate = expectedReturnMap[risk_profile] ?? 11.0;

    const emergency_fund_months = Number(
      (
        (profile.existingSavings || 0) / Math.max(1000, total_expenses)
      ).toFixed(2)
    );

    const features = {
      age: profile.age || 26,
      monthly_income: income,
      total_expenses: Math.round(total_expenses),
      savings_rate: Number(savings_rate.toFixed(4)),
      essential_expense_ratio: Number(essential_ratio.toFixed(4)),
      discretionary_expense_ratio: Number(discretionary_ratio.toFixed(4)),
      food_ratio: Number(
        (foodExpense / Math.max(1, total_expenses)).toFixed(4)
      ),
      entertainment_ratio: Number(
        (entertainmentExpense / Math.max(1, total_expenses)).toFixed(4)
      ),
      shopping_ratio: Number(
        (shoppingExpense / Math.max(1, total_expenses)).toFixed(4)
      ),
      debt_to_income: Number((emiExpense / Math.max(1, income)).toFixed(4)),
      emergency_fund_months: Math.min(24.0, emergency_fund_months),
      investment_ratio: Number(
        (
          (profile.existingInvestments || 0) /
          Math.max(1, income * 12)
        ).toFixed(4)
      ),
      dependents: profile.dependents || 0,
      risk_profile,
      existing_savings: profile.existingSavings || 0,
      existing_investments: profile.existingInvestments || 0,
      expected_return_rate,
    };

    return features;
  }

  /**
   * Classify user behaviour (Saver, Balanced, Overspender)
   */
  async classifyUser(userId, manualFeatures = null) {
    const features = manualFeatures || (await this.extractUserFeatures(userId));

    // Ensure only valid classification features are passed
    const classificationPayload = {
      age: features.age,
      monthly_income: features.monthly_income,
      total_expenses: features.total_expenses,
      savings_rate: features.savings_rate,
      essential_expense_ratio: features.essential_expense_ratio,
      discretionary_expense_ratio: features.discretionary_expense_ratio,
      food_ratio: features.food_ratio || 0.1,
      entertainment_ratio: features.entertainment_ratio || 0.05,
      shopping_ratio: features.shopping_ratio || 0.05,
      debt_to_income: features.debt_to_income || 0,
      emergency_fund_months: features.emergency_fund_months || 0,
      investment_ratio: features.investment_ratio || 0,
      dependents: features.dependents || 0,
      risk_profile: features.risk_profile || 1,
    };

    const result = await mlClient.classify(classificationPayload);

    // Persist prediction log for transparency & viva audit
    try {
      await PredictionLog.create({
        userId,
        type: 'classification',
        inputSnapshot: classificationPayload,
        output: result,
        modelVersion: result.model_version || '1.0.0',
        source: result.source || 'ml_service',
        isFallback: Boolean(result.is_fallback),
        latencyMs: result.latency_ms || 0,
      });
    } catch (logErr) {
      logger.warn(`Failed to save prediction log: ${logErr.message}`);
    }

    return {
      features: classificationPayload,
      ...result,
    };
  }

  /**
   * Forecast future savings (12-month) and wealth (5-year)
   */
  async forecastUser(userId, manualFeatures = null) {
    const features = manualFeatures || (await this.extractUserFeatures(userId));

    const forecastPayload = {
      age: features.age,
      monthly_income: features.monthly_income,
      total_expenses: features.total_expenses,
      savings_rate: features.savings_rate,
      essential_expense_ratio: features.essential_expense_ratio,
      discretionary_expense_ratio: features.discretionary_expense_ratio,
      food_ratio: features.food_ratio || 0.1,
      entertainment_ratio: features.entertainment_ratio || 0.05,
      shopping_ratio: features.shopping_ratio || 0.05,
      debt_to_income: features.debt_to_income || 0,
      emergency_fund_months: features.emergency_fund_months || 0,
      investment_ratio: features.investment_ratio || 0,
      dependents: features.dependents || 0,
      risk_profile: features.risk_profile || 1,
      existing_savings: features.existing_savings || 0,
      existing_investments: features.existing_investments || 0,
      expected_return_rate: features.expected_return_rate || 11.0,
    };

    const result = await mlClient.forecast(forecastPayload);

    // Persist prediction log
    try {
      await PredictionLog.create({
        userId,
        type: 'forecast',
        inputSnapshot: forecastPayload,
        output: result,
        modelVersion: result.model_version || '1.0.0',
        source: result.source || 'ml_service',
        isFallback: Boolean(result.is_fallback),
        latencyMs: result.latency_ms || 0,
      });
    } catch (logErr) {
      logger.warn(`Failed to save prediction log: ${logErr.message}`);
    }

    return {
      features: forecastPayload,
      ...result,
    };
  }

  /**
   * Fetch prediction history for user
   */
  async getHistory(userId, type = null, limit = 10) {
    const filter = { userId };
    if (type) filter.type = type;

    return PredictionLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();
  }

  /**
   * Fetch model metrics
   */
  async getMetrics() {
    return mlClient.getMetrics();
  }
}

module.exports = new PredictionService();
