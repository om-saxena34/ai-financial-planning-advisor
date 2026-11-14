const financialMath = require('../utils/financialMath');
const ApiResponse = require('../utils/ApiResponse');

function calculateSip(req, res, next) {
  try {
    const data = req.validated || req.body;
    const result = financialMath.calculateSip(data);

    if (data.inflationRate) {
      result.inflationAdjustedValue = financialMath.adjustForInflation(
        result.futureValue,
        data.years,
        data.inflationRate
      );
    }

    return ApiResponse.success(res, result, 'SIP calculation complete');
  } catch (err) {
    next(err);
  }
}

function calculateCompound(req, res, next) {
  try {
    const data = req.validated || req.body;
    const result = financialMath.calculateCompoundInterest(data);
    return ApiResponse.success(
      res,
      result,
      'Compound interest calculation complete'
    );
  } catch (err) {
    next(err);
  }
}

function calculateRequiredSip(req, res, next) {
  try {
    const data = req.validated || req.body;
    const result = financialMath.calculateRequiredSip(data);
    return ApiResponse.success(
      res,
      result,
      'Required SIP calculation complete'
    );
  } catch (err) {
    next(err);
  }
}

function calculateStepUpSip(req, res, next) {
  try {
    const data = req.validated || req.body;
    const result = financialMath.calculateStepUpSip(data);
    return ApiResponse.success(
      res,
      result,
      'Step-up SIP calculation complete'
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculateSip,
  calculateCompound,
  calculateRequiredSip,
  calculateStepUpSip,
};
