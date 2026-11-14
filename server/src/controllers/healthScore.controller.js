const healthScoreService = require('../services/healthScore.service');
const ApiResponse = require('../utils/ApiResponse');

async function getHealthScore(req, res, next) {
  try {
    const score = await healthScoreService.computeHealthScore(
      req.user.userId,
      false
    );
    return ApiResponse.success(res, score, 'Health score calculated');
  } catch (err) {
    next(err);
  }
}

async function calculateAndSave(req, res, next) {
  try {
    const score = await healthScoreService.computeHealthScore(
      req.user.userId,
      true
    );
    return ApiResponse.success(
      res,
      score,
      'Health score calculated and snapshot saved'
    );
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const history = await healthScoreService.getHistory(req.user.userId);
    return ApiResponse.success(
      res,
      { history },
      'Health score history retrieved'
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHealthScore,
  calculateAndSave,
  getHistory,
};
