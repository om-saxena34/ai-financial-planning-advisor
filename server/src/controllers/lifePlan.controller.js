const LifePlan = require('../models/LifePlan');
const FinancialProfile = require('../models/FinancialProfile');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const features = require('../config/features');
const {
  calcFutureLifePlan,
  calcReadinessStep,
} = require('../../../shared/financialCalc');

/**
 * Calculate year-by-year projections for Future Life Plan.
 */
const projectPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    let income = req.body.currentIncome;
    let expenses = req.body.currentExpenses;
    let savings = req.body.existingSavings;

    // Use profile defaults if fields are not explicitly provided
    if (userId && (income === undefined || expenses === undefined)) {
      const profile = await FinancialProfile.findOne({ userId }).lean();
      if (profile) {
        if (income === undefined) income = profile.monthlyIncome || 50000;
        if (expenses === undefined) expenses = profile.fixedExpenses || 30000;
        if (savings === undefined) savings = profile.existingSavings || 25000;
      }
    }

    const plan = calcFutureLifePlan({
      currentIncome: Number(income) || 50000,
      currentExpenses: Number(expenses) || 30000,
      existingSavings: Number(savings) || 25000,
      salaryGrowthRate: Number(req.body.salaryGrowthRate) || 8,
      expenseInflationRate: Number(req.body.expenseInflationRate) || 6,
      salaryMilestones: req.body.salaryMilestones || [],
      lifeEvents: req.body.lifeEvents || [],
      investWhen: req.body.investWhen || 'now',
      investThreshold: Number(req.body.investThreshold) || 50000,
      startingSip: Number(req.body.startingSip) || 2500,
      sipStepUpRate: Number(req.body.sipStepUpRate) || 10,
      comfortLevel: req.body.comfortLevel || 'balanced',
      timelineYears: Number(req.body.timelineYears) || 10,
    });

    return ApiResponse.success(res, plan, 'Future life plan calculated');
  } catch (err) {
    next(err);
  }
};

/**
 * Get 5-Step Readiness Ladder status for the user.
 */
const getReadinessLadder = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    let income = 50000;
    let expenses = 30000;
    let savings = 25000;
    let debt = 0;
    let hasInsurance = false;
    let monthsTracked = 1;

    if (userId) {
      const profile = await FinancialProfile.findOne({ userId }).lean();
      if (profile) {
        income = profile.monthlyIncome || income;
        expenses = profile.fixedExpenses || expenses;
        savings = profile.existingSavings || savings;
        hasInsurance = Boolean(profile.hasHealthInsurance);
      }

      const txCount = await Transaction.countDocuments({ userId });
      if (txCount > 5) monthsTracked = 3;
    }

    const ladder = calcReadinessStep({
      monthlyIncome: income,
      monthlyExpenses: expenses,
      liquidSavings: savings,
      debtPayments: debt,
      hasInsurance,
      monthsTracked,
    });

    return ApiResponse.success(res, ladder, 'Readiness ladder retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * Save or update the user's Future Life Plan.
 */
const savePlan = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw ApiError.unauthorized('Please log in to save your life plan');
    }

    const {
      title,
      comfortLevel,
      investWhen,
      investThreshold,
      startingSip,
      salaryGrowthRate,
      expenseInflationRate,
      timelineYears,
      salaryMilestones,
      lifeEvents,
      summary,
    } = req.body;

    const savedPlan = await LifePlan.findOneAndUpdate(
      { userId },
      {
        userId,
        title: title || 'My Future Life Plan',
        comfortLevel: comfortLevel || 'balanced',
        investWhen: investWhen || 'now',
        investThreshold: Number(investThreshold) || 50000,
        startingSip: Number(startingSip) || 2500,
        salaryGrowthRate: Number(salaryGrowthRate) || 8,
        expenseInflationRate: Number(expenseInflationRate) || 6,
        timelineYears: Number(timelineYears) || 10,
        salaryMilestones: salaryMilestones || [],
        lifeEvents: lifeEvents || [],
        summary: summary || {},
      },
      { new: true, upsert: true }
    );

    return ApiResponse.success(res, savedPlan, 'Life plan saved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve the user's saved Future Life Plan.
 */
const getSavedPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return ApiResponse.success(res, null, 'No plan found for guest');
    }

    const plan = await LifePlan.findOne({ userId }).lean();
    return ApiResponse.success(res, plan, 'Saved life plan retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  projectPlan,
  getReadinessLadder,
  savePlan,
  getSavedPlan,
};
