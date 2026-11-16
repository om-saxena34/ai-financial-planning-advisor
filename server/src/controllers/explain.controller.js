const explainerService = require('../services/explainer.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

async function explainScore(req, res, next) {
  try {
    const data = await explainerService.explainScore(req.user.userId);
    return ApiResponse.success(res, data, 'Score breakdown ready');
  } catch (err) { next(err); }
}

async function explainRecommendation(req, res, next) {
  try {
    const rec = req.body;
    if (!rec || !rec.title) throw ApiError.badRequest('Send the recommendation object in the request body');
    const explanation = explainerService.explainRecommendation(rec);
    return ApiResponse.success(res, explanation, 'Recommendation explained');
  } catch (err) { next(err); }
}

module.exports = { explainScore, explainRecommendation };
