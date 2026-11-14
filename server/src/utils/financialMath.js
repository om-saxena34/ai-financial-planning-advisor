/**
 * Pure Mathematical Financial Calculation Utilities
 * =================================================
 * Industry-standard financial formulas for SIP, compound interest,
 * step-up investments, and inflation adjustments.
 */

/**
 * Calculate Monthly SIP Future Value
 * Formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 * where:
 *   P = monthly investment
 *   i = annualRate / 12 / 100 (monthly rate)
 *   n = years * 12 (months)
 *
 * @param {Object} params
 * @param {number} params.monthlyAmount - Monthly SIP installment (P)
 * @param {number} params.annualRate - Expected annual return rate in % (e.g. 12)
 * @param {number} params.years - Investment horizon in years
 * @returns {Object} { totalInvested, futureValue, wealthGain, yearlySchedule }
 */
function calculateSip({ monthlyAmount, annualRate, years }) {
  if (monthlyAmount <= 0 || years <= 0) {
    return {
      totalInvested: 0,
      futureValue: 0,
      wealthGain: 0,
      yearlySchedule: [],
    };
  }

  const n = Math.round(years * 12);
  const totalInvested = monthlyAmount * n;

  // Handle 0% return edge-case
  if (annualRate === 0) {
    const yearlySchedule = [];
    for (let y = 1; y <= years; y++) {
      const inv = monthlyAmount * y * 12;
      yearlySchedule.push({
        year: y,
        invested: Math.round(inv),
        interestEarned: 0,
        totalValue: Math.round(inv),
      });
    }
    return {
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(totalInvested),
      wealthGain: 0,
      yearlySchedule,
    };
  }

  const i = annualRate / 12 / 100;
  const fv = monthlyAmount * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  const wealthGain = fv - totalInvested;

  // Generate Year-by-Year breakdown for charts
  const yearlySchedule = [];
  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const invYear = monthlyAmount * months;
    const fvYear = monthlyAmount * (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
    yearlySchedule.push({
      year: y,
      invested: Math.round(invYear),
      interestEarned: Math.round(Math.max(0, fvYear - invYear)),
      totalValue: Math.round(fvYear),
    });
  }

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(fv),
    wealthGain: Math.round(wealthGain),
    yearlySchedule,
  };
}

/**
 * Calculate Compound Interest on a Lump Sum
 * Formula: A = P * (1 + r/n)^(n*t)
 * where:
 *   P = principal
 *   r = annual interest rate as decimal (rate / 100)
 *   n = compounding frequency per year (1=annually, 2=semi, 4=quarterly, 12=monthly)
 *   t = time in years
 *
 * @param {Object} params
 * @param {number} params.principal - Initial lump sum deposit (P)
 * @param {number} params.annualRate - Annual return rate in %
 * @param {number} params.years - Horizon in years (t)
 * @param {number} [params.compoundingFrequency=12] - Compounding times per year (n)
 * @returns {Object} { principal, futureValue, interestEarned, yearlySchedule }
 */
function calculateCompoundInterest({
  principal,
  annualRate,
  years,
  compoundingFrequency = 12,
}) {
  if (principal <= 0 || years <= 0) {
    return {
      principal: 0,
      futureValue: 0,
      interestEarned: 0,
      yearlySchedule: [],
    };
  }

  if (annualRate === 0) {
    const yearlySchedule = [];
    for (let y = 1; y <= years; y++) {
      yearlySchedule.push({
        year: y,
        invested: Math.round(principal),
        interestEarned: 0,
        totalValue: Math.round(principal),
      });
    }
    return {
      principal: Math.round(principal),
      futureValue: Math.round(principal),
      interestEarned: 0,
      yearlySchedule,
    };
  }

  const r = annualRate / 100;
  const n = compoundingFrequency;
  const nt = n * years;
  const futureValue = principal * Math.pow(1 + r / n, nt);
  const interestEarned = futureValue - principal;

  const yearlySchedule = [];
  for (let y = 1; y <= years; y++) {
    const fvY = principal * Math.pow(1 + r / n, n * y);
    yearlySchedule.push({
      year: y,
      invested: Math.round(principal),
      interestEarned: Math.round(fvY - principal),
      totalValue: Math.round(fvY),
    });
  }

  return {
    principal: Math.round(principal),
    futureValue: Math.round(futureValue),
    interestEarned: Math.round(interestEarned),
    yearlySchedule,
  };
}

/**
 * Solve for Required Monthly SIP to hit a Target Future Value
 * Formula: P = (FV * i) / [((1 + i)^n - 1) * (1 + i)]
 *
 * @param {Object} params
 * @param {number} params.targetAmount - Desired wealth goal (FV)
 * @param {number} params.annualRate - Expected annual return rate in %
 * @param {number} params.years - Time until goal in years
 * @returns {Object} { requiredMonthlySip, totalInvested, expectedGains }
 */
function calculateRequiredSip({ targetAmount, annualRate, years }) {
  if (targetAmount <= 0 || years <= 0) {
    return {
      requiredMonthlySip: 0,
      totalInvested: 0,
      expectedGains: 0,
    };
  }

  const n = Math.round(years * 12);

  if (annualRate === 0) {
    const monthly = targetAmount / n;
    return {
      requiredMonthlySip: Math.ceil(monthly),
      totalInvested: Math.round(targetAmount),
      expectedGains: 0,
    };
  }

  const i = annualRate / 12 / 100;
  const numerator = targetAmount * i;
  const denominator = (Math.pow(1 + i, n) - 1) * (1 + i);
  const requiredMonthlySip = numerator / denominator;
  const totalInvested = requiredMonthlySip * n;
  const expectedGains = targetAmount - totalInvested;

  return {
    requiredMonthlySip: Math.ceil(requiredMonthlySip),
    totalInvested: Math.round(totalInvested),
    expectedGains: Math.round(Math.max(0, expectedGains)),
  };
}

/**
 * Calculate Step-Up SIP (where monthly amount increases by stepUpPercent each year)
 *
 * @param {Object} params
 * @param {number} params.initialMonthlyAmount - Starting monthly investment
 * @param {number} params.annualRate - Expected annual rate in %
 * @param {number} params.years - Investment horizon in years
 * @param {number} params.stepUpPercent - Annual increment % (e.g. 10%)
 * @returns {Object} { totalInvested, futureValue, wealthGain, yearlySchedule }
 */
function calculateStepUpSip({
  initialMonthlyAmount,
  annualRate,
  years,
  stepUpPercent = 10,
}) {
  if (initialMonthlyAmount <= 0 || years <= 0) {
    return {
      totalInvested: 0,
      futureValue: 0,
      wealthGain: 0,
      yearlySchedule: [],
    };
  }

  const i = annualRate / 12 / 100;
  let totalInvested = 0;
  let totalFv = 0;
  const yearlySchedule = [];

  // Simulate each year's compounding
  let currentMonthly = initialMonthlyAmount;

  for (let y = 1; y <= years; y++) {
    const yearInvestment = currentMonthly * 12;
    totalInvested += yearInvestment;

    // Remaining years this year's batch compounds
    const remainingYears = years - y;

    // FV of this year's 12 monthly installments at the end of the year
    let fvOneYear = 0;
    if (i === 0) {
      fvOneYear = yearInvestment;
    } else {
      fvOneYear = currentMonthly * (((Math.pow(1 + i, 12) - 1) / i) * (1 + i));
    }

    // Compound that sum for the remaining years
    const fvAtHorizon = fvOneYear * Math.pow(1 + annualRate / 100, remainingYears);
    totalFv += fvAtHorizon;

    yearlySchedule.push({
      year: y,
      monthlyAmount: Math.round(currentMonthly),
      invested: Math.round(totalInvested),
      totalValue: 0, // will compute running FV below
    });

    // Step-up for next year
    currentMonthly = currentMonthly * (1 + stepUpPercent / 100);
  }

  // Compute accurate running year-by-year curve
  let runningInvested = 0;
  let runningSip = initialMonthlyAmount;
  let cumulativeCurve = 0;

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      cumulativeCurve = (cumulativeCurve + runningSip) * (1 + i);
    }
    runningInvested += runningSip * 12;
    yearlySchedule[y - 1].invested = Math.round(runningInvested);
    yearlySchedule[y - 1].totalValue = Math.round(cumulativeCurve);
    yearlySchedule[y - 1].interestEarned = Math.round(
      Math.max(0, cumulativeCurve - runningInvested)
    );
    runningSip = runningSip * (1 + stepUpPercent / 100);
  }

  return {
    totalInvested: Math.round(runningInvested),
    futureValue: Math.round(cumulativeCurve),
    wealthGain: Math.round(cumulativeCurve - runningInvested),
    yearlySchedule,
  };
}

/**
 * Adjust Future Value for Inflation (Real Purchasing Power)
 * Formula: Real = Nominal / (1 + inflationRate/100)^years
 *
 * @param {number} nominalValue - Nominal future value
 * @param {number} years - Time horizon in years
 * @param {number} [inflationRate=6] - Annual inflation rate in %
 * @returns {number} Real inflation-adjusted purchasing power
 */
function adjustForInflation(nominalValue, years, inflationRate = 6) {
  if (nominalValue <= 0 || years <= 0) return nominalValue;
  const realValue = nominalValue / Math.pow(1 + inflationRate / 100, years);
  return Math.round(realValue);
}

module.exports = {
  calculateSip,
  calculateCompoundInterest,
  calculateRequiredSip,
  calculateStepUpSip,
  adjustForInflation,
};
