/**
 * Student Mode service — calculations for student-specific features.
 * All pure math lives in shared/financialCalc.js; this module only does
 * DB lookups and assembles results.
 */
const FinancialProfile = require('../models/FinancialProfile');
const { calcEffectiveIncome, firstSalarySplit, semesterFeePlan } = require('../../../shared/financialCalc');

/**
 * Get the student financial profile and effective income.
 */
async function getStudentProfile(userId) {
  const profile = await FinancialProfile.findOne({ userId });
  if (!profile) throw new Error('No profile found. Please complete onboarding first.');
  const effectiveIncome = profile.incomeSources && profile.incomeSources.length > 0
    ? calcEffectiveIncome(profile.incomeSources)
    : profile.monthlyIncome;
  return { profile, effectiveIncome };
}

/**
 * Compute semester fee plan for all fee entries in the profile.
 */
async function getSemesterPlan(userId) {
  const { profile, effectiveIncome } = await getStudentProfile(userId);
  const plans = (profile.semesterFees || []).map((fee) =>
    semesterFeePlan(fee.amount, fee.dueDate, fee.savedSoFar || 0)
  );
  return { effectiveIncome, plans };
}

/**
 * Save/update semester fees in the profile.
 */
async function saveSemesterFees(userId, fees) {
  const profile = await FinancialProfile.findOneAndUpdate(
    { userId },
    { $set: { semesterFees: fees } },
    { new: true, runValidators: true }
  );
  if (!profile) throw new Error('Profile not found');
  return profile;
}

/**
 * First-salary planner — 50/30/20 split with Indian context.
 */
async function getFirstSalaryPlan(userId, { salary, city = 'tier1' } = {}) {
  const profile = await FinancialProfile.findOne({ userId });
  const targetSalary = salary || profile?.expectedFirstSalary || 0;
  if (!targetSalary || targetSalary <= 0) throw new Error('Please enter your expected salary first.');
  const plan = firstSalarySplit(targetSalary, city);
  return plan;
}

module.exports = { getStudentProfile, getSemesterPlan, saveSemesterFees, getFirstSalaryPlan };
