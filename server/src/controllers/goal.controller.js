const goalService = require('../services/goal.service');
const ApiResponse = require('../utils/ApiResponse');

class GoalController {
  async createGoal(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const goal = await goalService.createGoal(userId, req.body);
      return ApiResponse.created(res, goal, 'Goal created successfully');
    } catch (err) {
      next(err);
    }
  }

  async getGoals(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const goals = await goalService.getGoals(userId, req.query);
      return ApiResponse.success(res, goals, 'Goals retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getGoalById(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const goal = await goalService.getGoalById(userId, req.params.id);
      return ApiResponse.success(res, goal, 'Goal retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateGoal(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const goal = await goalService.updateGoal(userId, req.params.id, req.body);
      return ApiResponse.success(res, goal, 'Goal updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async contribute(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const goal = await goalService.contribute(userId, req.params.id, req.body.amount);
      return ApiResponse.success(res, goal, 'Contribution added successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteGoal(req, res, next) {
    try {
      const userId = req.user.userId || req.user._id;
      const result = await goalService.deleteGoal(userId, req.params.id);
      return ApiResponse.success(res, result, 'Goal deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GoalController();
