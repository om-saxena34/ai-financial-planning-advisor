/**
 * @module categories
 * Canonical categories for transactions, income sources and payment
 * methods used throughout the application.
 */

/** @typedef {'essential'|'discretionary'|'income'} CategoryType */

/**
 * All expense / income categories.
 * @type {ReadonlyArray<{value:string, label:string, type:CategoryType}>}
 */
const EXPENSE_CATEGORIES = Object.freeze([
  { value: 'rent', label: 'Rent', type: 'essential' },
  { value: 'food', label: 'Food & Groceries', type: 'essential' },
  { value: 'transport', label: 'Transport', type: 'essential' },
  { value: 'education', label: 'Education', type: 'essential' },
  { value: 'entertainment', label: 'Entertainment', type: 'discretionary' },
  { value: 'shopping', label: 'Shopping', type: 'discretionary' },
  { value: 'health', label: 'Health & Medical', type: 'essential' },
  { value: 'utilities', label: 'Utilities', type: 'essential' },
  { value: 'emi_debt', label: 'EMI / Debt Repayment', type: 'essential' },
  { value: 'investments', label: 'Investments', type: 'essential' },
  { value: 'other', label: 'Other', type: 'discretionary' },
]);

/**
 * Income-specific categories.
 * @type {ReadonlyArray<{value:string, label:string, type:CategoryType}>}
 */
const INCOME_CATEGORIES = Object.freeze([
  { value: 'salary', label: 'Salary', type: 'income' },
  { value: 'freelance', label: 'Freelance', type: 'income' },
  { value: 'other_income', label: 'Other Income', type: 'income' },
]);

/**
 * Supported payment methods.
 * @type {ReadonlyArray<{value:string, label:string}>}
 */
const PAYMENT_METHODS = Object.freeze([
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other', label: 'Other' },
]);

/* ── Helper functions ──────────────────────────────────────────────── */

const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/**
 * Returns true if the given category value is essential.
 * @param {string} value - Category value key.
 * @returns {boolean}
 */
function isEssential(value) {
  const cat = allCategories.find((c) => c.value === value);
  return cat ? cat.type === 'essential' : false;
}

/**
 * Returns true if the given category value is discretionary.
 * @param {string} value - Category value key.
 * @returns {boolean}
 */
function isDiscretionary(value) {
  const cat = allCategories.find((c) => c.value === value);
  return cat ? cat.type === 'discretionary' : false;
}

/**
 * Get the human-readable label for a category value.
 * @param {string} value - Category value key.
 * @returns {string|undefined}
 */
function getCategoryLabel(value) {
  const cat = allCategories.find((c) => c.value === value);
  return cat ? cat.label : undefined;
}

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  isEssential,
  isDiscretionary,
  getCategoryLabel,
};
