const profileService = require('../services/profile.service');
const ApiResponse = require('../utils/ApiResponse');

async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.user.userId);
    return ApiResponse.success(
      res,
      { profile },
      profile ? 'Financial profile retrieved' : 'No profile found for user'
    );
  } catch (err) {
    next(err);
  }
}

async function upsertProfile(req, res, next) {
  try {
    const profileData = req.validated || req.body;
    const profile = await profileService.upsertProfile(req.user.userId, profileData);
    return ApiResponse.success(
      res,
      { profile },
      'Financial profile saved successfully'
    );
  } catch (err) {
    next(err);
  }
}

async function deleteProfile(req, res, next) {
  try {
    const result = await profileService.deleteProfile(req.user.userId);
    return ApiResponse.success(res, result, 'Financial profile reset');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  upsertProfile,
  deleteProfile,
};
