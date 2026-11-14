/**
 * Format a number as Indian-locale currency.
 * @param {number} amount
 * @param {string} currency - ISO 4217 code, default 'INR'
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to a locale-friendly string.
 * @param {string|Date} date
 * @param {'short'|'medium'|'long'} format
 * @returns {string}
 */
export function formatDate(date, format = 'medium') {
  if (!date) return '—';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' },
  };

  return new Intl.DateTimeFormat('en-IN', options[format] || options.medium).format(d);
}

/**
 * Format a decimal as a percentage string.
 * @param {number} value - e.g. 0.12 or 12
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format large numbers using Indian notation (L = Lakh, Cr = Crore).
 * @param {number} num
 * @returns {string}
 */
export function formatCompactNumber(num) {
  if (num == null || isNaN(num)) return '—';

  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1e7) {
    return `${sign}${(abs / 1e7).toFixed(2)} Cr`;
  }
  if (abs >= 1e5) {
    return `${sign}${(abs / 1e5).toFixed(2)} L`;
  }
  if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(1)}K`;
  }
  return `${sign}${abs}`;
}
