/**
 * FinWise Entity Extractor
 * Parses user input for Indian currency quantities, tenures, rates, and intent flags.
 */

// Normalizes text (lowercase, trims punctuation)
function normalizeText(text) {
  return (text || '').toLowerCase().trim();
}

/**
 * Extracts Indian money amounts from strings.
 * Handles:
 *  - 5k, 25k -> 5000, 25000
 *  - 1L, 1.5L, 2 lakh, 10 lakhs, 5 lac -> 100000, 150000, 200000, etc.
 *  - 1 cr, 2.5 crore, 10 crores -> 10000000, 25000000, etc.
 *  - ₹5,000, Rs. 10,000, INR 500 -> 5000, 10000, 500
 */
function extractAmounts(text) {
  const norm = normalizeText(text);
  const amounts = [];

  // Crores pattern: e.g. 1.5 cr, 2 crore, 3 crores
  const crRegex = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/gi;
  let match;
  while ((match = crRegex.exec(norm)) !== null) {
    amounts.push(Math.round(parseFloat(match[1]) * 10000000));
  }

  // Lakhs pattern: e.g. 1.5 L, 2 lakh, 50 lacs, 1.25lakhs
  const lakhRegex = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:l|lac|lacs|lakh|lakhs)\b/gi;
  while ((match = lakhRegex.exec(norm)) !== null) {
    amounts.push(Math.round(parseFloat(match[1]) * 100000));
  }

  // Thousands pattern (k): e.g. 5k, 50k, 12.5k
  const kRegex = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/gi;
  while ((match = kRegex.exec(norm)) !== null) {
    amounts.push(Math.round(parseFloat(match[1]) * 1000));
  }

  // Rupee symbol or Rs numbers: e.g. ₹5,000, Rs 5000, 50,000
  const currencyRegex = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/gi;
  while ((match = currencyRegex.exec(norm)) !== null) {
    const cleanNum = match[1].replace(/,/g, '');
    amounts.push(Math.round(parseFloat(cleanNum)));
  }

  // Standalone numbers >= 500 if no amount found yet
  if (amounts.length === 0) {
    const numRegex = /\b(\d{3,9})\b/g;
    while ((match = numRegex.exec(norm)) !== null) {
      amounts.push(parseInt(match[1], 10));
    }
  }

  return amounts;
}

/**
 * Extracts percentage values from text (e.g. 12%, 11.5 percent)
 */
function extractPercentages(text) {
  const norm = normalizeText(text);
  const percentages = [];
  const pctRegex = /(\d+(?:\.\d+)?)\s*(?:%|percent|p\.a\.)/gi;
  let match;
  while ((match = pctRegex.exec(norm)) !== null) {
    percentages.push(parseFloat(match[1]));
  }
  return percentages;
}

/**
 * Extracts timeframe / duration in years or months.
 */
function extractTimeframes(text) {
  const norm = normalizeText(text);
  const timeframes = [];

  // Years: e.g. 10 years, 5 yrs, 3 yr, 15y
  const yearRegex = /(\d+)\s*(?:years|year|yrs|yr|saal|sal)\b/gi;
  let match;
  while ((match = yearRegex.exec(norm)) !== null) {
    timeframes.push({ value: parseInt(match[1], 10), unit: 'years' });
  }

  // Months: e.g. 6 months, 3 mo, 12 mahine
  const monthRegex = /(\d+)\s*(?:months|month|mo|mahine|mahina)\b/gi;
  while ((match = monthRegex.exec(norm)) !== null) {
    timeframes.push({ value: parseInt(match[1], 10), unit: 'months' });
  }

  return timeframes;
}

/**
 * Main extractor returning clean entity payload
 */
function extractEntities(text) {
  const amounts = extractAmounts(text);
  const percentages = extractPercentages(text);
  const timeframes = extractTimeframes(text);

  return {
    raw: text,
    normalized: normalizeText(text),
    amounts,
    primaryAmount: amounts[0] || null,
    percentages,
    primaryPercentage: percentages[0] || null,
    timeframes,
    primaryYears:
      timeframes.find((t) => t.unit === 'years')?.value ||
      (timeframes.find((t) => t.unit === 'months')?.value ? timeframes.find((t) => t.unit === 'months').value / 12 : null),
  };
}

module.exports = {
  extractEntities,
  extractAmounts,
  extractPercentages,
  extractTimeframes,
  normalizeText,
};
