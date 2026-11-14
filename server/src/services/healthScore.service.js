const mongoose = require('mongoose');
const FinancialProfile = require('../models/FinancialProfile');
const Transaction = require('../models/Transaction');
const HealthScoreSnapshot = require('../models/HealthScoreSnapshot');
const { calculateHealthScore } = require('../utils/healthScoreCalc');

/**
 * Compute health score from current profile, transactions and goals
 */
async function computeHealthScore(userId, saveSnapshot = false) {
  const uId = new mongoose.Types.ObjectId(userId);

  // 1. Fetch user financial profile
  const profile = await FinancialProfile.findOne({ userId: uId });

  // 2. Fetch past 30 days transactions summary
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const txAgg = await Transaction.aggregate([
    {
      $match: {
        userId: uId,
        date: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let txIncome = 0;
  let txExpense = 0;
  txAgg.forEach((t) => {
    if (t._id === 'income') txIncome = t.total;
    if (t._id === 'expense') txExpense = t.total;
  });

  // Effective metrics: fallback to FinancialProfile if transactions are sparse
  const monthlyIncome = txIncome > 0 ? txIncome : (profile?.monthlyIncome || 0);
  const monthlyExpenses = txExpense > 0 ? txExpense : (profile?.fixedExpenses || 0);
  const essentialExpenses = profile?.fixedExpenses || (monthlyExpenses * 0.6);
  const liquidSavings = profile?.existingSavings || 0;
  const existingInvestments = profile?.existingInvestments || 0;

  // Compute Health Score
  const scoreResult = calculateHealthScore({
    monthlyIncome,
    monthlyExpenses,
    essentialExpenses,
    liquidSavings,
    debtPayments: Math.round(monthlyExpenses * 0.15), // estimate from expenses if debt not explicitly isolated
    monthlyInvestments: Math.round(monthlyIncome * 0.10),
    goalProgressAvg: 60,
    goalCount: 1,
  });

  // Save snapshot if requested
  if (saveSnapshot && monthlyIncome > 0) {
    await HealthScoreSnapshot.create({
      userId: uId,
      score: scoreResult.score,
      band: scoreResult.band,
      color: scoreResult.color,
      summary: scoreResult.summary,
      components: scoreResult.components,
      date: new Date(),
    });
  }

  return scoreResult;
}

/**
 * Get score history trend for charts
 */
async function getHistory(userId) {
  const uId = new mongoose.Types.ObjectId(userId);
  const snapshots = await HealthScoreSnapshot.find({ userId: uId })
    .sort({ date: 1 })
    .limit(30);

  return snapshots;
}

module.exports = {
  computeHealthScore,
  getHistory,
};
