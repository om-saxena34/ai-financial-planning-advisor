const mongoose = require('mongoose');

/**
 * Scenario — a saved What-If configuration (up to 3 per user).
 */
const scenarioSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:    { type: String, default: 'My Scenario', maxlength: 60 },
  params: {
    incomeDelta:    { type: Number, default: 0 },
    expenseCutPct:  { type: Number, default: 0 },
    sipBoost:       { type: Number, default: 0 },
    returnRate:     { type: Number, default: 11 },
  },
  results: {
    simScore:    { type: Number },
    sim1yWealth: { type: Number },
    sim5yWealth: { type: Number },
    sim10yWealth:{ type: Number },
    newIncome:   { type: Number },
    newExpenses: { type: Number },
    summary:     { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('Scenario', scenarioSchema);
