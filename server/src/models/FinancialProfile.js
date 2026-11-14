const mongoose = require('mongoose');

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
