const predictionService = require('../services/prediction.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for Machine Learning predictions & metrics
 */
class PredictionController {
  async classify(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const manualFeatures = req.body && Object.keys(req.body).length > 0 ? req.body : null;
      const result = await predictionService.classifyUser(
        userId,
        manualFeatures
      );
      return ApiResponse.success(res, result, 'Classification completed');
    } catch (err) {
      next(err);
    }
  }

  async forecast(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const manualFeatures = req.body && Object.keys(req.body).length > 0 ? req.body : null;
      const result = await predictionService.forecastUser(
        userId,
        manualFeatures
      );
      return ApiResponse.success(res, result, 'Forecast completed');
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const { type, limit } = req.query;
      const logs = await predictionService.getHistory(userId, type, limit);
      return ApiResponse.success(res, logs, 'Prediction history retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await predictionService.getMetrics();
      return ApiResponse.success(res, metrics, 'ML model metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PredictionController();
