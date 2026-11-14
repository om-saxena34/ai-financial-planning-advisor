const mongoose = require('mongoose');

/**
 * InvestmentPlan Schema
 * Stores customized SIP investment schedules, step-up projections,
 * and inflation-adjusted forecasts tied to user goals or general wealth creation.
 */
const investmentPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: 100,
    },
    monthlyAmount: {
      type: Number,
      required: [true, 'Monthly investment amount is required'],
      min: [100, 'Monthly investment must be at least 100'],
    },
    expectedAnnualReturn: {
      type: Number,
      required: true,
      default: 12,
      min: [1, 'Expected annual return must be at least 1%'],
      max: [30, 'Expected annual return cannot exceed 30%'],
    },
    tenureYears: {
      type: Number,
      required: true,
      default: 5,
      min: [1, 'Tenure must be at least 1 year'],
      max: [40, 'Tenure cannot exceed 40 years'],
    },
    stepUpPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Step up percentage cannot be negative'],
      max: [50, 'Step up percentage cannot exceed 50%'],
    },
    inflationRate: {
      type: Number,
      default: 0,
      min: [0, 'Inflation rate cannot be negative'],
      max: [20, 'Inflation rate cannot exceed 20%'],
    },
    summary: {
      totalInvested: { type: Number, default: 0 },
      estimatedWealth: { type: Number, default: 0 },
      totalReturns: { type: Number, default: 0 },
      realWealthAdjusted: { type: Number, default: 0 },
    },
    yearlyBreakdown: [
      {
        year: Number,
        invested: Number,
        returns: Number,
        totalWealth: Number,
        realWealth: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

investmentPlanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);
