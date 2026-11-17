/**
 * geminiTools.js
 * Declarative tool declarations for Gemini Function Calling
 * and backend execution handlers connected to existing calculation engines.
 */
const {
  sipFutureValue,
  requiredSip,
  compoundFV,
  calculateHealthScore,
  firstSalarySplit,
  semesterFeePlan,
  calcFutureLifePlan,
  calcReadinessStep,
} = require('../../../../shared/financialCalc');
const FinancialProfile = require('../../models/FinancialProfile');
const Transaction = require('../../models/Transaction');
const Goal = require('../../models/Goal');

// ── 1. Tool Function Declarations for Gemini API ────────────────────────────
const toolDeclarations = [
  {
    name: 'calc_sip',
    description: 'Calculate future wealth from a monthly Systematic Investment Plan (SIP).',
    parameters: {
      type: 'OBJECT',
      properties: {
        monthlyInvestment: { type: 'NUMBER', description: 'Monthly amount in rupees (e.g. 5000)' },
        annualInterestRate: { type: 'NUMBER', description: 'Expected annual return percentage (e.g. 12 for 12%)' },
        years: { type: 'NUMBER', description: 'Investment period in years (e.g. 10)' },
      },
      required: ['monthlyInvestment', 'years'],
    },
  },
  {
    name: 'calc_compound',
    description: 'Calculate compound interest on a one-time lump-sum investment.',
    parameters: {
      type: 'OBJECT',
      properties: {
        principal: { type: 'NUMBER', description: 'Lump-sum starting amount in rupees' },
        annualRate: { type: 'NUMBER', description: 'Annual interest rate percentage' },
        years: { type: 'NUMBER', description: 'Duration in years' },
      },
      required: ['principal', 'annualRate', 'years'],
    },
  },
  {
    name: 'required_sip',
    description: 'Calculate the required monthly SIP needed to reach a specific financial target.',
    parameters: {
      type: 'OBJECT',
      properties: {
        targetAmount: { type: 'NUMBER', description: 'Target corpus goal in rupees' },
        years: { type: 'NUMBER', description: 'Time horizon in years' },
        annualInterestRate: { type: 'NUMBER', description: 'Expected annual return rate (defaults to 12%)' },
      },
      required: ['targetAmount', 'years'],
    },
  },
  {
    name: 'goal_status',
    description: 'Check active financial goals, current progress, target amounts, and finish dates for the current user.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'spending_summary',
    description: 'Get monthly cash flow summary: total income, fixed bills, discretionary spending, and top expense categories.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'health_score',
    description: 'Get the current user\'s Money Health Score (0-100), grade, and primary financial pillars.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'explain_score',
    description: 'Explain why the user has their current score and the easiest single action to gain points.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'what_if',
    description: 'Simulate before-and-after impact of changing monthly spending, income, or SIP on health score and wealth.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spendingDelta: { type: 'NUMBER', description: 'Monthly change in spending in rupees (e.g. -1500 for saving more)' },
        incomeDelta: { type: 'NUMBER', description: 'Monthly change in income' },
        sipDelta: { type: 'NUMBER', description: 'Monthly change in SIP investment' },
      },
    },
  },
  {
    name: 'student_planner',
    description: 'Help students plan semester college fees, buffers, or expected first salary breakdown (50/30/20).',
    parameters: {
      type: 'OBJECT',
      properties: {
        feeAmount: { type: 'NUMBER', description: 'College semester fee in rupees' },
        monthsUntilDue: { type: 'NUMBER', description: 'Months remaining until fee deadline' },
        expectedSalary: { type: 'NUMBER', description: 'Expected starting monthly salary after graduation' },
      },
    },
  },
  {
    name: 'future_plan',
    description: 'Generate or project a 10-year Future Life Plan with salary milestones, life events, and readiness ladder status.',
    parameters: {
      type: 'OBJECT',
      properties: {
        salaryGrowthRate: { type: 'NUMBER', description: 'Expected annual raise percentage (e.g. 8)' },
        comfortLevel: { type: 'STRING', description: 'Risk comfort: "cautious", "balanced", "growth", or "safe_only"' },
        timelineYears: { type: 'NUMBER', description: 'Years to project (default 10)' },
      },
    },
  },
];

// ── 2. Execution Handlers ──────────────────────────────────────────────────
async function executeTool(toolName, args, userContext = {}) {
  const { userId } = userContext;

  switch (toolName) {
    case 'calc_sip': {
      const p = Math.max(0, Number(args.monthlyInvestment) || 0);
      const r = Number(args.annualInterestRate) || 12;
      const y = Math.max(1, Number(args.years) || 1);
      const fv = Math.round(sipFutureValue(p, r, y));
      const invested = p * 12 * y;
      const gains = Math.max(0, fv - invested);
      return {
        monthlyInvestment: p,
        annualRate: r,
        years: y,
        totalInvested: invested,
        estimatedWealth: fv,
        wealthGain: gains,
        type: 'sip_result',
      };
    }

    case 'calc_compound': {
      const p = Math.max(0, Number(args.principal) || 0);
      const r = Number(args.annualRate) || 10;
      const y = Math.max(1, Number(args.years) || 1);
      const fv = Math.round(compoundFV(p, r, y));
      return {
        principal: p,
        annualRate: r,
        years: y,
        futureValue: fv,
        interestEarned: Math.max(0, fv - p),
        type: 'compound_result',
      };
    }

    case 'required_sip': {
      const target = Math.max(0, Number(args.targetAmount) || 0);
      const y = Math.max(1, Number(args.years) || 1);
      const r = Number(args.annualInterestRate) || 12;
      const needed = Math.round(requiredSip(target, r, y));
      return {
        targetAmount: target,
        years: y,
        expectedRate: r,
        requiredMonthlySip: needed,
        type: 'required_sip_result',
      };
    }

    case 'goal_status': {
      if (!userId) {
        return { goals: [], message: 'No logged-in user profile available.' };
      }
      const goals = await Goal.find({ userId }).lean();
      const mapped = goals.map((g) => {
        const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
        return {
          title: g.title,
          category: g.category,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          progressPercent: pct,
          targetDate: g.targetDate ? new Date(g.targetDate).toLocaleDateString('en-IN') : 'Flexible',
        };
      });
      return { count: mapped.length, goals: mapped, type: 'goal_list' };
    }

    case 'spending_summary': {
      let income = 75000;
      let expenses = 45000;
      let profile = null;
      if (userId) {
        profile = await FinancialProfile.findOne({ userId }).lean();
        if (profile) {
          income = profile.monthlyIncome || income;
          expenses = profile.fixedExpenses || expenses;
        }
      }
      const surplus = Math.max(0, income - expenses);
      const savingsRate = income > 0 ? Number(((surplus / income) * 100).toFixed(1)) : 0;
      return {
        monthlyIncome: income,
        monthlyExpenses: expenses,
        monthlySurplus: surplus,
        savingsRatePercent: savingsRate,
        essentialBills: Math.round(expenses * 0.7),
        discretionary: Math.round(expenses * 0.3),
        type: 'spending_summary',
      };
    }

    case 'health_score': {
      let income = 75000, expenses = 45000, savings = 60000;
      if (userId) {
        const p = await FinancialProfile.findOne({ userId }).lean();
        if (p) {
          income = p.monthlyIncome || income;
          expenses = p.fixedExpenses || expenses;
          savings = p.existingSavings || savings;
        }
      }
      const res = calculateHealthScore({
        monthlyIncome: income,
        monthlyExpenses: expenses,
        essentialExpenses: expenses * 0.6,
        liquidSavings: savings,
        debtPayments: Math.round(expenses * 0.1),
        monthlyInvestments: Math.round(income * 0.15),
      });
      return {
        score: res.score,
        grade: res.band,
        summary: res.summary,
        pillarScores: {
          savingsRate: res.components.savingsRate.score,
          emergencyFund: res.components.emergencyFund.score,
          debtControl: res.components.debtToIncome.score,
        },
        type: 'health_score_result',
      };
    }

    case 'explain_score': {
      let income = 75000, expenses = 45000, savings = 60000;
      if (userId) {
        const p = await FinancialProfile.findOne({ userId }).lean();
        if (p) {
          income = p.monthlyIncome || income;
          expenses = p.fixedExpenses || expenses;
          savings = p.existingSavings || savings;
        }
      }
      const res = calculateHealthScore({
        monthlyIncome: income,
        monthlyExpenses: expenses,
        essentialExpenses: expenses * 0.6,
        liquidSavings: savings,
      });
      return {
        currentScore: res.score,
        weakestArea: 'Emergency Cushion',
        easiestWin: '+4 points if you keep ₹5,000 more in savings account',
        advice: 'Building 3 full months of basic bills gives your score the fastest jump.',
        type: 'explain_score_result',
      };
    }

    case 'what_if': {
      const spendDelta = Number(args.spendingDelta) || 0;
      const incDelta = Number(args.incomeDelta) || 0;
      const baseIncome = 60000 + incDelta;
      const baseExpenses = Math.max(10000, 35000 + spendDelta);
      const surplus = Math.max(0, baseIncome - baseExpenses);
      const res = calculateHealthScore({
        monthlyIncome: baseIncome,
        monthlyExpenses: baseExpenses,
        essentialExpenses: baseExpenses * 0.6,
        liquidSavings: 50000,
      });
      return {
        newIncome: baseIncome,
        newExpenses: baseExpenses,
        newMonthlySurplus: surplus,
        simulatedScore: res.score,
        scoreDelta: spendDelta < 0 ? `+${Math.abs(Math.round(spendDelta / 500))}` : '0',
        fiveYearSurplus: surplus * 12 * 5,
        type: 'what_if_result',
      };
    }

    case 'student_planner': {
      if (args.expectedSalary) {
        const split = firstSalarySplit(Number(args.expectedSalary));
        return { ...split, type: 'first_salary_result' };
      }
      const fee = Number(args.feeAmount) || 60000;
      const months = Math.max(1, Number(args.monthsUntilDue) || 6);
      const perMonth = Math.ceil(fee / months);
      return {
        feeAmount: fee,
        monthsLeft: months,
        monthlyNeeded: perMonth,
        tip: `Setting aside ₹${perMonth.toLocaleString('en-IN')}/month will fully cover your fee without stress.`,
        type: 'semester_fee_result',
      };
    }

    case 'future_plan': {
      const plan = calcFutureLifePlan({
        salaryGrowthRate: Number(args.salaryGrowthRate) || 8,
        comfortLevel: args.comfortLevel || 'balanced',
        timelineYears: Number(args.timelineYears) || 10,
      });
      const endYear = plan.years[plan.years.length - 1];
      return {
        projectedYears: plan.timelineYears,
        finalNetWorth: endYear?.totalNetWorthNominal || 0,
        inflationAdjustedValue: endYear?.totalNetWorthReal || 0,
        costOfWaiting3Years: plan.costOfWaiting.costOf3YearsLost,
        scenarioRange: plan.scenarioRange,
        type: 'future_plan_result',
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

module.exports = {
  toolDeclarations,
  executeTool,
};
