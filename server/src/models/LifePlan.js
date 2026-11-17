const mongoose = require('mongoose');

const lifeEventSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const salaryMilestoneSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    salary: { type: Number, required: true },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const lifePlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'My 10-Year Life Plan',
    },
    comfortLevel: {
      type: String,
      enum: ['cautious', 'balanced', 'growth', 'safe_only'],
      default: 'balanced',
    },
    investWhen: {
      type: String,
      enum: ['now', 'when_salary_hits', 'after_years', 'never_safe_only'],
      default: 'now',
    },
    investThreshold: {
      type: Number,
      default: 50000,
    },
    startingSip: {
      type: Number,
      default: 2500,
    },
    salaryGrowthRate: {
      type: Number,
      default: 8,
    },
    expenseInflationRate: {
      type: Number,
      default: 6,
    },
    timelineYears: {
      type: Number,
      default: 10,
    },
    salaryMilestones: [salaryMilestoneSchema],
    lifeEvents: [lifeEventSchema],
    summary: {
      finalNominal: Number,
      finalReal: Number,
      costOfWaiting3Years: Number,
      readinessStep: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LifePlan', lifePlanSchema);
