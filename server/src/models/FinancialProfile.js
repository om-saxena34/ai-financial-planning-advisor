const mongoose = require('mongoose');

// Income source sub-schema (used in Student Mode for irregular income)
const incomeSourceSchema = new mongoose.Schema({
  label:       { type: String, default: 'Other' },
  type:        { type: String, enum: ['pocket_money','scholarship','part_time','internship','family','other'], default: 'other' },
  amount:      { type: Number, default: 0, min: 0 },
  isIrregular: { type: Boolean, default: false }, // irregular = use median, not sum
}, { _id: false });

// Semester fee entry
const semesterFeeSchema = new mongoose.Schema({
  amount:    { type: Number, default: 0, min: 0 },
  dueDate:   { type: Date },
  savedSoFar:{ type: Number, default: 0, min: 0 },
  label:     { type: String, default: 'Semester Fee' },
}, { _id: false });

const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Age must be at least 18'],
      max: [100, 'Age cannot exceed 100'],
    },
    occupationType: {
      type: String,
      enum: ['student', 'salaried', 'self-employed', 'business', 'other'],
      default: 'salaried',
    },
    monthlyIncome: {
      type: Number,
      required: [true, 'Monthly income is required'],
      min: [0, 'Monthly income cannot be negative'],
    },
    // Student Mode: multiple income sources (pocket money, scholarship, part-time…)
    incomeSources: { type: [incomeSourceSchema], default: [] },
    // Student Mode: semester fee planning
    semesterFees: { type: [semesterFeeSchema], default: [] },
    // Student Mode: expected first salary (for first-salary planner)
    expectedFirstSalary: { type: Number, default: 0, min: 0 },
    // Which months have extra expenses (festivals, exams, etc.)
    bufferMonths: { type: [String], default: [] },
    fixedExpenses: {
      type: Number,
      required: [true, 'Fixed expenses is required'],
      min: [0, 'Fixed expenses cannot be negative'],
    },
    riskProfile: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
    existingSavings: {
      type: Number,
      default: 0,
      min: [0, 'Existing savings cannot be negative'],
    },
    existingInvestments: {
      type: Number,
      default: 0,
      min: [0, 'Existing investments cannot be negative'],
    },
    dependents: {
      type: Number,
      default: 0,
      min: [0, 'Dependents cannot be negative'],
    },
    // City tier — affects rent estimates in first-salary planner
    cityTier: { type: String, enum: ['tier1','tier2','other'], default: 'tier1' },
  },
  {
    timestamps: true,
  }
);

financialProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const FinancialProfile = mongoose.model('FinancialProfile', financialProfileSchema);

module.exports = FinancialProfile;
