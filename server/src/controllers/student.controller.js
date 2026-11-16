const studentService = require('../services/studentMode.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

async function getSemesterPlan(req, res, next) {
  try {
    const data = await studentService.getSemesterPlan(req.user.userId);
    return ApiResponse.success(res, data, 'Semester plan ready');
  } catch (err) { next(err); }
}

async function saveSemesterFees(req, res, next) {
  try {
    const { fees } = req.body;
    if (!Array.isArray(fees)) throw ApiError.badRequest('fees must be an array');
    const profile = await studentService.saveSemesterFees(req.user.userId, fees);
    return ApiResponse.success(res, { profile }, 'Semester fees saved');
  } catch (err) { next(err); }
}

async function getFirstSalaryPlan(req, res, next) {
  try {
    const { salary, city } = req.body;
    const plan = await studentService.getFirstSalaryPlan(req.user.userId, { salary: Number(salary || 0), city });
    return ApiResponse.success(res, { plan }, 'First salary plan ready');
  } catch (err) { next(err); }
}

module.exports = { getSemesterPlan, saveSemesterFees, getFirstSalaryPlan };
