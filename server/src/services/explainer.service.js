/**
 * Explainer service — answers "Why is my score X?" and "Why am I a Saver/Balanced/Overspender?"
 * Uses the existing calculateHealthScore engine. No SHAP/LIME needed.
 */
const mongoose = require('mongoose');
const FinancialProfile = require('../models/FinancialProfile');
const Transaction = require('../models/Transaction');
const { calculateHealthScore } = require('../../../shared/financialCalc');

async function explainScore(userId) {
  const uId = new mongoose.Types.ObjectId(userId);
  const profile = await FinancialProfile.findOne({ userId: uId });
  if (!profile) throw new Error('Profile not found');

  // Build the same metrics as healthScore.service.js
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const txAgg = await Transaction.aggregate([
    { $match: { userId: uId, date: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  let txIncome = 0, txExpense = 0;
  txAgg.forEach((t) => {
    if (t._id === 'income')  txIncome  = t.total;
    if (t._id === 'expense') txExpense = t.total;
  });

  const monthlyIncome    = txIncome  > 0 ? txIncome  : profile.monthlyIncome;
  const monthlyExpenses  = txExpense > 0 ? txExpense : profile.fixedExpenses;
  const essentialExpenses= profile.fixedExpenses || monthlyExpenses * 0.6;
  const liquidSavings    = profile.existingSavings || 0;
  const monthlyInvestments = Math.round(monthlyIncome * 0.10);
  const emergencyFundTarget = profile.occupationType === 'student' ? 3 : 6;

  const result = calculateHealthScore({
    monthlyIncome, monthlyExpenses, essentialExpenses, liquidSavings,
    debtPayments: Math.round(monthlyExpenses * 0.15), monthlyInvestments,
    goalProgressAvg: 60, goalCount: 1, emergencyFundTarget,
  });

  // "Easiest win" — find the pillar with the lowest score and calculate impact
  const components = result.components;
  const pillars = Object.entries(components).sort((a, b) => a[1].score - b[1].score);
  const weakest = pillars[0];
  const easiestWin = buildEasiestWin(weakest[0], weakest[1], monthlyIncome, liquidSavings, monthlyExpenses, emergencyFundTarget);

  // Human-readable pillar explanations
  const explanations = Object.entries(components).map(([key, val]) => ({
    name: pillarName(key),
    score: val.score,
    weight: val.weight,
    contribution: Math.round((val.score * val.weight) / 100),
    rawValue: val.rawValue,
    unit: val.unit,
    tip: val.tip,
    emoji: pillarEmoji(key),
  }));

  return { score: result.score, band: result.band, summary: result.summary, explanations, easiestWin };
}

function pillarName(key) {
  const names = {
    savingsRate: 'How much you save',
    expenseControl: 'Spending control',
    emergencyFund: 'Emergency money',
    debtToIncome: 'Loan burden',
    investmentRatio: 'Investing habit',
    goalProgress: 'Goal progress',
  };
  return names[key] || key;
}

function pillarEmoji(key) {
  const emojis = { savingsRate:'💰', expenseControl:'📊', emergencyFund:'🛡️', debtToIncome:'🏦', investmentRatio:'📈', goalProgress:'🎯' };
  return emojis[key] || '•';
}

function buildEasiestWin(pillar, val, income, savings, expenses, efTarget) {
  if (pillar === 'savingsRate') {
    const extra = Math.round(income * 0.05);
    return `Save ₹${extra.toLocaleString('en-IN')} more each month (about 5% of your income) to gain up to +4 points.`;
  }
  if (pillar === 'emergencyFund') {
    const needed = Math.max(0, (expenses * efTarget) - savings);
    const monthly = Math.round(needed / 12);
    return `Set aside ₹${monthly.toLocaleString('en-IN')} every month to reach your ${efTarget}-month emergency fund goal in 1 year.`;
  }
  if (pillar === 'expenseControl') {
    const cut = Math.round(expenses * 0.08);
    return `Cut ₹${cut.toLocaleString('en-IN')} from optional spending (eating out, subscriptions) to gain up to +5 points.`;
  }
  if (pillar === 'investmentRatio') {
    const startSip = Math.round(income * 0.05);
    return `Start a SIP of ₹${startSip.toLocaleString('en-IN')}/month to begin investing and gain up to +6 points.`;
  }
  if (pillar === 'debtToIncome') {
    return 'Pay off one small loan or avoid new EMIs to lower your loan burden and gain points.';
  }
  return 'Set a savings goal to start tracking progress and gain extra points.';
}

/**
 * Explain a recommendation — what data was used, what rule, what effect.
 */
function explainRecommendation(rec) {
  return {
    title: rec.title,
    dataUsed: rec.trigger || 'Your spending and saving patterns',
    rule: rec.rule || 'Based on your financial health score pillars',
    expectedEffect: rec.expectedImpact || 'Should improve your score over time',
    source: 'FinWise rule engine + your profile data',
    synthetic: false,
  };
}

module.exports = { explainScore, explainRecommendation };
