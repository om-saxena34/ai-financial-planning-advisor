/**
 * @module financial
 * Core financial constants and scoring configuration for the
 * AI Financial Planning Advisor.
 */

/**
 * @typedef {Object} HealthScoreBand
 * @property {string} label  - Human-readable label (Poor, Fair, etc.)
 * @property {number} min    - Inclusive lower bound
 * @property {number} max    - Inclusive upper bound
 * @property {string} color  - HEX colour used on the frontend
 */

/** @type {Readonly<Object>} */
const financialConfig = Object.freeze({
  /* ── Currency ─────────────────────────────────────────────────── */

  /** Default display currency */
  DEFAULT_CURRENCY: 'INR',

  /* ── Macro assumptions ────────────────────────────────────────── */

  /** Default annual inflation rate (%) */
  DEFAULT_INFLATION_RATE: 6,

  /** Expected annual return rates by risk profile (%) */
  DEFAULT_RETURN_RATES: Object.freeze({
    conservative: 7,
    moderate: 10,
    aggressive: 14,
  }),

  /* ── Health-score weights (must sum to 100) ───────────────────── */

  /**
   * Weight each component contributes to the overall financial-health
   * score (0–100).
   */
  HEALTH_SCORE_WEIGHTS: Object.freeze({
    savingsRate: 25,
    expenseControl: 20,
    emergencyFund: 20,
    debtToIncome: 15,
    investmentRatio: 10,
    goalProgress: 10,
  }),

  /* ── Health-score bands ───────────────────────────────────────── */

  /** @type {ReadonlyArray<HealthScoreBand>} */
  HEALTH_SCORE_BANDS: Object.freeze([
    { label: 'Poor', min: 0, max: 39, color: '#EF4444' },
    { label: 'Fair', min: 40, max: 59, color: '#F59E0B' },
    { label: 'Good', min: 60, max: 79, color: '#10B981' },
    { label: 'Excellent', min: 80, max: 100, color: '#3B82F6' },
  ]),

  /* ── Scoring thresholds per component ─────────────────────────── */

  /**
   * Thresholds used to convert raw ratios into sub-scores.
   * Each entry maps to { excellent, good, fair } cut-offs; below fair
   * the sub-score is proportionally lower.
   */
  SCORING_THRESHOLDS: Object.freeze({
    /** Savings rate as % of income */
    savingsRate: Object.freeze({
      excellent: 30,
      good: 20,
      fair: 10,
    }),

    /** Expense-to-income ratio (lower is better) */
    expenseControl: Object.freeze({
      excellent: 50,
      good: 65,
      fair: 80,
    }),

    /** Emergency-fund coverage in months of expenses */
    emergencyFund: Object.freeze({
      excellent: 6,
      good: 3,
      fair: 1,
    }),

    /** Debt-to-income ratio (lower is better) */
    debtToIncome: Object.freeze({
      excellent: 10,
      good: 20,
      fair: 40,
    }),

    /** Investment-to-income ratio */
    investmentRatio: Object.freeze({
      excellent: 25,
      good: 15,
      fair: 5,
    }),

    /** % of financial goals on-track */
    goalProgress: Object.freeze({
      excellent: 80,
      good: 60,
      fair: 40,
    }),
  }),
});

module.exports = financialConfig;
