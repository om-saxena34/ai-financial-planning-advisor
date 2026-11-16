const Scenario = require('../models/Scenario');
const FinancialProfile = require('../models/FinancialProfile');
const { calculateHealthScore, sipFutureValue, compoundFV } = require('../../../shared/financialCalc');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

const MAX_SCENARIOS = 3;

/** Build simulation results from params + live profile */
function runSimulation(profile, params) {
  const { incomeDelta = 0, expenseCutPct = 0, sipBoost = 0, returnRate = 11 } = params;
  const baseIncome   = profile.monthlyIncome || 0;
  const baseExpenses = profile.fixedExpenses  || 0;
  const baseSip      = Math.round(baseIncome * 0.1);

  const newIncome   = Math.max(5000, baseIncome + Number(incomeDelta));
  const cutAmt      = baseExpenses * (Number(expenseCutPct) / 100);
  const newExpenses = Math.max(1000, baseExpenses - cutAmt);
  const totalSip    = Math.max(0, baseSip + Number(sipBoost) + cutAmt * 0.5);

  const scoreResult = calculateHealthScore({
    monthlyIncome:    newIncome,
    monthlyExpenses:  newExpenses,
    essentialExpenses:newExpenses * 0.7,
    liquidSavings:    profile.existingSavings || 0,
    debtPayments:     Math.round(newExpenses * 0.15),
    monthlyInvestments: totalSip,
    goalProgressAvg:  60,
    goalCount:        1,
    emergencyFundTarget: profile.occupationType === 'student' ? 3 : 6,
  });

  const r = returnRate / 100;
  const existGrowth = compoundFV(profile.existingInvestments || 0, returnRate, 1);
  const sim1yWealth  = Math.round(sipFutureValue(totalSip, returnRate, 1) + existGrowth);
  const sim5yWealth  = Math.round(sipFutureValue(totalSip, returnRate, 5) + compoundFV(profile.existingInvestments || 0, returnRate, 5));
  const sim10yWealth = Math.round(sipFutureValue(totalSip, returnRate, 10) + compoundFV(profile.existingInvestments || 0, returnRate, 10));

  const scoreDiff  = scoreResult.score - (profile._baseScore || 0);
  const signStr    = scoreDiff >= 0 ? `goes up by ${scoreDiff}` : `goes down by ${Math.abs(scoreDiff)}`;
  const summary    = expenseCutPct > 0
    ? `If you cut spending by ${expenseCutPct}%, your score ${signStr} points and you could save ₹${((newIncome-newExpenses)*12).toLocaleString('en-IN')} in a year.`
    : `With these changes, your score ${signStr} points. You could build ₹${sim5yWealth.toLocaleString('en-IN')} in 5 years.`;

  return { simScore: scoreResult.score, sim1yWealth, sim5yWealth, sim10yWealth, newIncome, newExpenses, summary };
}

async function listScenarios(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const scenarios = await Scenario.find({ userId }).sort({ createdAt: -1 }).limit(MAX_SCENARIOS);
    return ApiResponse.success(res, { scenarios }, 'Your saved scenarios');
  } catch (err) { next(err); }
}

async function saveScenario(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const count  = await Scenario.countDocuments({ userId });
    if (count >= MAX_SCENARIOS) {
      throw ApiError.badRequest(`You can save up to ${MAX_SCENARIOS} scenarios. Delete one first.`);
    }
    const profile = await FinancialProfile.findOne({ userId });
    if (!profile) throw ApiError.badRequest('Complete your profile first');

    const params  = req.body.params || {};
    const results = runSimulation(profile, params);
    const name    = (req.body.name || 'Scenario').slice(0, 60);

    const scenario = await Scenario.create({ userId, name, params, results });
    return ApiResponse.created(res, { scenario }, 'Scenario saved!');
  } catch (err) { next(err); }
}

async function deleteScenario(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const deleted = await Scenario.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) throw ApiError.notFound('Scenario not found');
    return ApiResponse.success(res, {}, 'Scenario deleted');
  } catch (err) { next(err); }
}

async function simulateLive(req, res, next) {
  try {
    const userId  = new mongoose.Types.ObjectId(req.user.userId);
    const profile = await FinancialProfile.findOne({ userId });
    if (!profile) throw ApiError.badRequest('Complete your profile first');
    const results = runSimulation(profile, req.body);
    return ApiResponse.success(res, results, 'Simulation ready');
  } catch (err) { next(err); }
}

module.exports = { listScenarios, saveScenario, deleteScenario, simulateLive };
