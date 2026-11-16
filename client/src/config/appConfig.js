const rawApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_LOCALE = 'en-IN';

export const APP_NAME = 'FinWise';

export const HEALTH_SCORE_BANDS = [
  { min: 0, max: 30, label: 'Critical', color: '#ef4444', bg: 'bg-red-500' },
  { min: 31, max: 50, label: 'Poor', color: '#f97316', bg: 'bg-orange-500' },
  { min: 51, max: 65, label: 'Fair', color: '#eab308', bg: 'bg-yellow-500' },
  { min: 66, max: 80, label: 'Good', color: '#22c55e', bg: 'bg-green-500' },
  { min: 81, max: 100, label: 'Excellent', color: '#06b6d4', bg: 'bg-cyan-500' },
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Rent',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Insurance',
  'Investments',
  'Personal Care',
  'Travel',
  'Gifts & Donations',
  'Subscriptions',
  'Miscellaneous',
];

export const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservative', description: 'Prefer safety over returns' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced risk and returns' },
  { value: 'aggressive', label: 'Aggressive', description: 'Higher risk for higher returns' },
];

export const OCCUPATION_TYPES = [
  'Salaried',
  'Self-Employed',
  'Business Owner',
  'Freelancer',
  'Student',
  'Retired',
  'Homemaker',
  'Other',
];
