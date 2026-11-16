/**
 * client/src/utils/financialCalc.js
 * Browser-side financial calculation engine (ES Module).
 * Mirrors shared/financialCalc.js with 100% formula parity.
 */

export function interpolate(value, points) {
  if (value <= points[0][0]) return points[0][1];
  if (value >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (value >= x0 && value <= x1) {
      if (x1 === x0) return y0;
      return y0 + ((value - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return points[0][1];
}

export function scoreSavingsRate(rate) {
  return Math.min(100, Math.max(0, interpolate(rate, [[-10,0],[0,0],[5,25],[10,50],[20,75],[30,100],[100,100]])));
}
export function scoreExpenseControl(ratio) {
  return Math.min(100, Math.max(0, interpolate(ratio, [[0.4,100],[0.5,100],[0.6,75],[0.7,50],[0.8,25],[0.95,0],[1.0,0]])));
}
export function scoreEmergencyFund(months) {
  return Math.min(100, Math.max(0, interpolate(months, [[0,0],[1,25],[2,50],[4,75],[6,100],[24,100]])));
}
export function scoreDebtToIncome(dti) {
  return Math.min(100, Math.max(0, interpolate(dti, [[0,100],[15,75],[30,50],[45,25],[60,0],[100,0]])));
}
export function scoreInvestmentRatio(ratio) {
  return Math.min(100, Math.max(0, interpolate(ratio, [[0,0],[5,25],[10,50],[15,75],[20,100],[100,100]])));
}
export function scoreGoalProgress(pct, count = 0) {
  if (count === 0) return 50;
  return Math.min(100, Math.max(0, pct));
}

export function calculateHealthScore({
  monthlyIncome,
  monthlyExpenses,
  essentialExpenses,
  liquidSavings,
  debtPayments = 0,
  monthlyInvestments = 0,
  goalProgressAvg = 50,
  goalCount = 0,
  emergencyFundTarget = 6,
}) {
  const WEIGHTS = { savingsRate:25, expenseControl:20, emergencyFund:20, debtToIncome:15, investmentRatio:10, goalProgress:10 };

  if (!monthlyIncome || monthlyIncome <= 0) {
    return {
      score: 0, band: 'Poor', color: '#ef4444',
      summary: 'Add your income and spending details to see your score.',
      components: {
        savingsRate:    { score:0, rawValue:0, weight:25, tip:'Add your income first' },
        expenseControl: { score:0, rawValue:0, weight:20, tip:'Track spending to see this' },
        emergencyFund:  { score:0, rawValue:0, weight:20, tip:`Build up ${emergencyFundTarget} months of savings` },
        debtToIncome:   { score:0, rawValue:0, weight:15, tip:'Keep loan payments under 30% of income' },
        investmentRatio:{ score:0, rawValue:0, weight:10, tip:'Aim to invest at least 10% of income' },
        goalProgress:   { score:50, rawValue:0, weight:10, tip:'Set your first saving goal' },
      },
    };
  }

  const netSavings        = monthlyIncome - monthlyExpenses;
  const rawSavingsRate    = (netSavings / monthlyIncome) * 100;
  const totalExp          = Math.max(1, monthlyExpenses);
  const rawEssentialRatio = essentialExpenses / totalExp;
  const monthlyEssential  = Math.max(1, essentialExpenses || monthlyExpenses * 0.5);
  const rawEmergencyMonths = liquidSavings / monthlyEssential;
  const scaledEmMonths    = (rawEmergencyMonths / emergencyFundTarget) * 6;
  const rawDti            = (debtPayments / monthlyIncome) * 100;
  const rawInvestRatio    = (monthlyInvestments / monthlyIncome) * 100;

  const savingsScore      = scoreSavingsRate(rawSavingsRate);
  const expenseScore      = scoreExpenseControl(rawEssentialRatio);
  const emergencyScore    = scoreEmergencyFund(scaledEmMonths);
  const debtScore         = scoreDebtToIncome(rawDti);
  const investScore       = scoreInvestmentRatio(rawInvestRatio);
  const goalScore         = scoreGoalProgress(goalProgressAvg, goalCount);

  const composite = Math.round(
    (savingsScore * WEIGHTS.savingsRate +
     expenseScore * WEIGHTS.expenseControl +
     emergencyScore * WEIGHTS.emergencyFund +
     debtScore * WEIGHTS.debtToIncome +
     investScore * WEIGHTS.investmentRatio +
     goalScore * WEIGHTS.goalProgress) / 100
  );
  const score = Math.min(100, Math.max(0, composite));

  let band, color, summary;
  if (score >= 80)      { band='Excellent'; color='#10b981'; summary='Great work! You are saving well and your money is in good shape.'; }
  else if (score >= 60) { band='Good';      color='#3b82f6'; summary='Solid start. Invest a little more each month and you will reach Excellent.'; }
  else if (score >= 40) { band='Fair';      color='#f59e0b'; summary='You are doing okay. Try to build your emergency fund and cut optional spending.'; }
  else                  { band='Poor';      color='#ef4444'; summary='Your money needs attention. Focus on spending less and saving more first.'; }

  return {
    score, band, color, summary,
    components: {
      savingsRate: { score: Math.round(savingsScore), weight: WEIGHTS.savingsRate, rawValue: Number(rawSavingsRate.toFixed(1)), unit: '%' },
      expenseControl: { score: Math.round(expenseScore), weight: WEIGHTS.expenseControl, rawValue: Number((rawEssentialRatio * 100).toFixed(1)), unit: '% on needs' },
      emergencyFund: { score: Math.round(emergencyScore), weight: WEIGHTS.emergencyFund, rawValue: Number(rawEmergencyMonths.toFixed(1)), unit: 'months' },
      debtToIncome: { score: Math.round(debtScore), weight: WEIGHTS.debtToIncome, rawValue: Number(rawDti.toFixed(1)), unit: '%' },
      investmentRatio: { score: Math.round(investScore), weight: WEIGHTS.investmentRatio, rawValue: Number(rawInvestRatio.toFixed(1)), unit: '%' },
      goalProgress: { score: Math.round(goalScore), weight: WEIGHTS.goalProgress, rawValue: Math.round(goalProgressAvg), unit: '%' },
    },
  };
}

export function sipFutureValue(monthly, annualRate, years) {
  if (monthly <= 0 || annualRate <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

export function requiredSip(target, annualRate, years) {
  if (target <= 0 || annualRate <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return target / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

export function compoundFV(principal, annualRate, years) {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return principal;
  return principal * Math.pow(1 + annualRate / 100, years);
}

export function median(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function calcEffectiveIncome(sources = []) {
  if (!sources.length) return 0;
  const irregular = sources.filter((s) => s.isIrregular).map((s) => s.amount);
  const fixed = sources.filter((s) => !s.isIrregular).reduce((sum, s) => sum + (s.amount || 0), 0);
  return fixed + median(irregular);
}

export function firstSalarySplit(salary, city = 'tier1') {
  if (!salary || salary <= 0) return null;
  const rentMultiplier = city === 'tier1' ? 0.25 : 0.18;
  const needs   = Math.round(salary * 0.50);
  const wants   = Math.round(salary * 0.30);
  const savings = Math.round(salary * 0.20);
  const rent    = Math.round(salary * rentMultiplier);
  const emergencyTarget  = Math.round(needs * 3);
  const startingSip      = Math.round(savings * 0.5);
  const emergencyMonthly = Math.round(savings * 0.5);
  const monthsToEmergency = emergencyMonthly > 0 ? Math.ceil(emergencyTarget / emergencyMonthly) : 0;

  return {
    salary, needs, wants, savings, rent,
    emergencyTarget, startingSip, emergencyMonthly, monthsToEmergency,
    sipFv1y:  Math.round(sipFutureValue(startingSip, 12, 1)),
    sipFv5y:  Math.round(sipFutureValue(startingSip, 12, 5)),
    sipFv10y: Math.round(sipFutureValue(startingSip, 12, 10)),
  };
}

export function semesterFeePlan(feeAmount, dueDate, currentSavings = 0) {
  if (!feeAmount || !dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const monthsLeft = Math.max(1, Math.ceil((due - now) / (1000 * 60 * 60 * 24 * 30.44)));
  const remaining = Math.max(0, feeAmount - currentSavings);
  const monthlyNeeded = Math.ceil(remaining / monthsLeft);
  const onTrack = currentSavings >= feeAmount || monthlyNeeded <= 2000;
  return { feeAmount, dueDate: due.toISOString(), currentSavings, remaining, monthsLeft, monthlyNeeded, onTrack };
}
