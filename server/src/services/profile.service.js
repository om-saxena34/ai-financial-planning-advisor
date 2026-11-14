const FinancialProfile = require('../models/FinancialProfile');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Retrieve user's financial profile
 */
async function getProfile(userId) {
  const profile = await FinancialProfile.findOne({ userId });
  return profile;
}

/**
 * Create or update user's financial profile and mark onboardingComplete = true
 */
async function upsertProfile(userId, profileData) {
  const profile = await FinancialProfile.findOneAndUpdate(
    { userId },
    {
      ...profileData,
      userId,
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Mark user's onboarding as completed
  await User.findByIdAndUpdate(userId, { onboardingComplete: true });

  return profile;
}

/**
 * Reset / clear financial profile
 */
async function deleteProfile(userId) {
  const deleted = await FinancialProfile.findOneAndDelete({ userId });
  if (deleted) {
    await User.findByIdAndUpdate(userId, { onboardingComplete: false });
  }
  return { message: 'Profile reset successfully' };
}

module.exports = {
  getProfile,
  upsertProfile,
  deleteProfile,
};
