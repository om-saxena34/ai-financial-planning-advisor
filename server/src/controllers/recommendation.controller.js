const recommendationService = require('../services/recommendation.service');
const ApiResponse = require('../utils/ApiResponse');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const recommendations =
        await recommendationService.generateRecommendations(userId);
      return ApiResponse.success(
        res,
        recommendations,
        'Recommendations generated successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const { status } = req.body;
      const updated = await recommendationService.updateStatus(
        userId,
        req.params.id,
        status
      );
      return ApiResponse.success(res, updated, 'Recommendation status updated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecommendationController();
