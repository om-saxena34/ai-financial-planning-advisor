/**
 * Financial Health Score Calculation Engine
 * ==========================================
 * Transparent, weighted composite index (0–100) evaluating a user's
 * financial discipline across 6 essential pillars.
 * Uses linear interpolation to prevent step-function cliff effects.
 */

const {
  HEALTH_SCORE_WEIGHTS,
  HEALTH_SCORE_BANDS,
} = require('../config/financial');

/**
 * Perform piecewise linear interpolation between breakpoint tuples: [[x0, y0], [x1, y1], ...]
 * @param {number} value
 * @param {Array<[number, number]>} points - Breakpoints sorted ascending by x
 * @returns {number} Interpolated score (0–100)
 */
function interpolate(value, points) {
  if (value <= points[0][0]) return points[0][1];
  if (value >= points[points.length - 1][0]) return points[points.length - 1][1];

  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];

    if (value >= x0 && value <= x1) {
      if (x1 === x0) return y0;
      const t = (value - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }

  return points[0][1];
}

/**
 * Score Savings Rate (%)
 * Target: >=30% (100 pts), 20% (75 pts), 10% (50 pts), 5% (25 pts), <0% (0 pts)
 */
function scoreSavingsRate(savingsRate) {
  const points = [
    [-10, 0],
    [0, 0],
    [5, 25],
    [10, 50],
    [20, 75],
    [30, 100],
    [100, 100],
  ];
  return Math.min(100, Math.max(0, interpolate(savingsRate, points)));
}

/**
 * Score Expense Control (Essentials / Total Expenses ratio 0–1)
 * Lower is better control (more room for discretionary & savings).
 * <=0.50 (100 pts), 0.60 (75 pts), 0.70 (50 pts), 0.80 (25 pts), >=0.95 (0 pts)
 */
function scoreExpenseControl(essentialRatio) {
  // Invert scale: higher ratio means poorer control
  const points = [
    [0.4, 100],
    [0.5, 100],
    [0.6, 75],
    [0.7, 50],
    [0.8, 25],
    [0.95, 0],
    [1.0, 0],
  ];
  return Math.min(100, Math.max(0, interpolate(essentialRatio, points)));
}

/**
 * Score Emergency Fund Coverage (Months of essential expenses)
 * Target: 6 months (100 pts), 4m (75 pts), 2m (50 pts), 1m (25 pts), 0m (0 pts)
 */
function scoreEmergencyFund(coverageMonths) {
  const points = [
    [0, 0],
    [1, 25],
    [2, 50],
    [4, 75],
    [6, 100],
    [24, 100],
  ];
  return Math.min(100, Math.max(0, interpolate(coverageMonths, points)));
}

/**
 * Score Debt-to-Income Ratio (DTI %)
 * Target: 0% (100 pts), <=15% (75 pts), <=30% (50 pts), <=45% (25 pts), >=60% (0 pts)
 */
function scoreDebtToIncome(dti) {
  const points = [
    [0, 100],
    [15, 75],
    [30, 50],
    [45, 25],
    [60, 0],
    [100, 0],
  ];
  return Math.min(100, Math.max(0, interpolate(dti, points)));
}

/**
 * Score Investment Consistency (Investments / Income %)
 * Target: >=20% (100 pts), 15% (75 pts), 10% (50 pts), 5% (25 pts), 0% (0 pts)
 */
function scoreInvestmentRatio(investRatio) {
  const points = [
    [0, 0],
    [5, 25],
    [10, 50],
    [15, 75],
    [20, 100],
    [100, 100],
  ];
  return Math.min(100, Math.max(0, interpolate(investRatio, points)));
}

/**
 * Score Goal Progress (0–100)
 * Defaults to 50 (neutral) if user has no goals configured yet.
 */
function scoreGoalProgress(progressPercent, goalCount = 0) {
  if (goalCount === 0) return 50; // Neutral baseline
  return Math.min(100, Math.max(0, progressPercent));
}

/**
 * Calculate the Full 0–100 Financial Health Score
 *
 * @param {Object} metrics
 * @param {number} metrics.monthlyIncome - Total take-home income
 * @param {number} metrics.monthlyExpenses - Total expenses
 * @param {number} metrics.essentialExpenses - Essential expenses
 * @param {number} metrics.liquidSavings - Current savings balance
 * @param {number} [metrics.debtPayments=0] - Monthly EMI / loan commitments
 * @param {number} [metrics.monthlyInvestments=0] - Monthly SIPs / investments
 * @param {number} [metrics.goalProgressAvg=50] - Average % progress on active goals
 * @param {number} [metrics.goalCount=0] - Number of active goals
 * @returns {Object} Composite score, band, breakdown, and explanations
 */
function calculateHealthScore({
  monthlyIncome,
  monthlyExpenses,
  essentialExpenses,
  liquidSavings,
  debtPayments = 0,
  monthlyInvestments = 0,
  goalProgressAvg = 50,
  goalCount = 0,
}) {
  // Edge-case: Zero or missing income
  if (!monthlyIncome || monthlyIncome <= 0) {
    return {
      score: 0,
      band: 'Poor',
      color: '#ef4444',
      summary: 'Add your income and expense details to calculate your Financial Health Score.',
      components: {
        savingsRate: { score: 0, rawValue: 0, weight: 25, tip: 'Add income to calculate savings rate' },
        expenseControl: { score: 0, rawValue: 0, weight: 20, tip: 'Track your expenses to evaluate budget discipline' },
        emergencyFund: { score: 0, rawValue: 0, weight: 20, tip: 'Set aside 3–6 months of essential living costs' },
        debtToIncome: { score: 0, rawValue: 0, weight: 15, tip: 'Keep debt commitments under 30% of income' },
        investmentRatio: { score: 0, rawValue: 0, weight: 10, tip: 'Aim to invest at least 10–20% of your earnings' },
        goalProgress: { score: 50, rawValue: 0, weight: 10, tip: 'Define your first savings goal' },
      },
    };
  }

  // 1. Savings Rate
  const netSavings = monthlyIncome - monthlyExpenses;
  const rawSavingsRate = (netSavings / monthlyIncome) * 100;
  const savingsScore = scoreSavingsRate(rawSavingsRate);

  // 2. Expense Control
  const totalExp = Math.max(1, monthlyExpenses);
  const rawEssentialRatio = essentialExpenses / totalExp;
  const expenseControlScore = scoreExpenseControl(rawEssentialRatio);

  // 3. Emergency Fund
  const monthlyEssential = Math.max(1, essentialExpenses || monthlyExpenses * 0.5);
  const rawEmergencyMonths = liquidSavings / monthlyEssential;
  const emergencyScore = scoreEmergencyFund(rawEmergencyMonths);

  // 4. Debt to Income
  const rawDti = (debtPayments / monthlyIncome) * 100;
  const debtScore = scoreDebtToIncome(rawDti);

  // 5. Investment Ratio
  const rawInvestRatio = (monthlyInvestments / monthlyIncome) * 100;
  const investScore = scoreInvestmentRatio(rawInvestRatio);

  // 6. Goal Progress
  const goalScore = scoreGoalProgress(goalProgressAvg, goalCount);

  // Weighted sum
  const weights = HEALTH_SCORE_WEIGHTS || {
    savingsRate: 25,
    expenseControl: 20,
    emergencyFund: 20,
    debtToIncome: 15,
    investmentRatio: 10,
    goalProgress: 10,
  };

  const compositeScore = Math.round(
    (savingsScore * weights.savingsRate +
      expenseControlScore * weights.expenseControl +
      emergencyScore * weights.emergencyFund +
      debtScore * weights.debtToIncome +
      investScore * weights.investmentRatio +
      goalScore * weights.goalProgress) /
      100
  );

  const clampedScore = Math.min(100, Math.max(0, compositeScore));

  // Determine band
  let band = 'Good';
  let color = '#3b82f6';
  let bandDescription = 'Healthy financial trajectory with room for optimization.';

  if (clampedScore >= 80) {
    band = 'Excellent';
    color = '#10b981';
    bandDescription = 'Superb financial discipline! Your savings rate, emergency reserve, and debt control are exemplary.';
  } else if (clampedScore >= 60) {
    band = 'Good';
    color = '#3b82f6';
    bandDescription = 'Strong financial foundation. Increasing your monthly investment allocation can push you into Excellent.';
  } else if (clampedScore >= 40) {
    band = 'Fair';
    color = '#f59e0b';
    bandDescription = 'Moderate financial stability. Focus on building your emergency cushion and curbing discretionary spending.';
  } else {
    band = 'Poor';
    color = '#ef4444';
    bandDescription = 'High financial vulnerability. Urgent attention needed on debt reduction and expense control.';
  }

  return {
    score: clampedScore,
    band,
    color,
    summary: bandDescription,
    components: {
      savingsRate: {
        score: Math.round(savingsScore),
        weight: weights.savingsRate,
        rawValue: Number(rawSavingsRate.toFixed(1)),
        unit: '%',
        tip:
          rawSavingsRate >= 30
            ? 'Excellent savings rate! Consistently save 30%+'
            : 'Aim to save at least 20–30% of take-home income.',
      },
      expenseControl: {
        score: Math.round(expenseControlScore),
        weight: weights.expenseControl,
        rawValue: Number((rawEssentialRatio * 100).toFixed(1)),
        unit: '% essentials',
        tip:
          rawEssentialRatio <= 0.6
            ? 'Great budget balance between essentials and discretionary spending.'
            : 'Discretionary spending is high. Review entertainment and shopping.',
      },
      emergencyFund: {
        score: Math.round(emergencyScore),
        weight: weights.emergencyFund,
        rawValue: Number(rawEmergencyMonths.toFixed(1)),
        unit: 'months',
        tip:
          rawEmergencyMonths >= 6
            ? 'Full 6-month safety net secured.'
            : `You have ${rawEmergencyMonths.toFixed(1)} months of emergency funds. Target is 6 months.`,
      },
      debtToIncome: {
        score: Math.round(debtScore),
        weight: weights.debtToIncome,
        rawValue: Number(rawDti.toFixed(1)),
        unit: '%',
        tip:
          rawDti <= 15
            ? 'Low, manageable debt load.'
            : 'Debt payments exceed 30% of income. Prioritize paying down high-interest liabilities.',
      },
      investmentRatio: {
        score: Math.round(investScore),
        weight: weights.investmentRatio,
        rawValue: Number(rawInvestRatio.toFixed(1)),
        unit: '%',
        tip:
          rawInvestRatio >= 15
            ? 'Solid investment consistency.'
            : 'Channel surplus funds into disciplined monthly SIPs.',
      },
      goalProgress: {
        score: Math.round(goalScore),
        weight: weights.goalProgress,
        rawValue: Math.round(goalProgressAvg),
        unit: '%',
        tip:
          goalCount === 0
            ? 'No goals set. Define financial goals to boost your score.'
            : `Active goals are progressing well at ${Math.round(goalProgressAvg)}% on average.`,
      },
    },
  };
}

module.exports = {
  interpolate,
  scoreSavingsRate,
  scoreExpenseControl,
  scoreEmergencyFund,
  scoreDebtToIncome,
  scoreInvestmentRatio,
  scoreGoalProgress,
  calculateHealthScore,
};
