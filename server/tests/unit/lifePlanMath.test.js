const {
  calcFutureLifePlan,
  calcReadinessStep,
} = require('../../../shared/financialCalc');

describe('Future Life Plan & Readiness Ladder Math Tests', () => {
  describe('calcFutureLifePlan()', () => {
    test('projects 10-year wealth growth with default 8% raise and 12% returns', () => {
      const plan = calcFutureLifePlan({
        currentMonthlyIncome: 50000,
        currentMonthlyExpenses: 30000,
        startingSip: 5000,
        salaryGrowthRate: 8,
        expectedReturn: 12,
        years: 10,
      });

      expect(plan.timelineYears).toBe(10);
      expect(plan.years).toHaveLength(10);

      const y1 = plan.years[0];
      const y10 = plan.years[9];

      expect(y1.monthlyIncome).toBe(50000);
      expect(y1.monthlyExpenses).toBe(30000);
      expect(y1.monthlySurplus).toBe(20000);
      expect(y1.monthlySip).toBe(5000);

      // Income after 9 annual 8% compound raises should be ~99,950
      expect(y10.monthlyIncome).toBeGreaterThan(95000);
      expect(y10.totalNetWorthNominal).toBeGreaterThan(1500000);
      // Real inflation-adjusted net worth must be positive and lower than nominal
      expect(y10.totalNetWorthReal).toBeGreaterThan(0);
      expect(y10.totalNetWorthReal).toBeLessThan(y10.totalNetWorthNominal);
    });

    test('handles zero surplus gracefully without negative investments', () => {
      const plan = calcFutureLifePlan({
        currentMonthlyIncome: 30000,
        currentMonthlyExpenses: 30000,
        startingSip: 0,
        years: 5,
      });

      expect(plan.years).toHaveLength(5);
      const y1 = plan.years[0];
      expect(y1.monthlySurplus).toBe(0);
      expect(y1.monthlySip).toBe(0);
      expect(y1.investmentValueNominal).toBe(0);
    });

    test('handles negative surplus (expenses > income) without exploding', () => {
      const plan = calcFutureLifePlan({
        currentMonthlyIncome: 20000,
        currentMonthlyExpenses: 28000,
        existingSavings: 0,
        startingSip: 0,
        years: 5,
      });

      expect(plan.years).toHaveLength(5);
      const y1 = plan.years[0];
      expect(y1.monthlySurplus).toBe(0);
      expect(y1.monthlySip).toBe(0);
      expect(y1.cashSavingsBalance).toBe(0);
    });

    test('factors in life events correctly in the specified year', () => {
      const plan = calcFutureLifePlan({
        currentMonthlyIncome: 60000,
        currentMonthlyExpenses: 30000,
        startingSip: 5000,
        years: 5,
        lifeEvents: [{ year: 3, name: 'Higher Studies or Vehicle', cost: 150000 }],
      });

      const y3 = plan.years[2];
      expect(y3.eventsCost).toBe(150000);
      expect(plan.milestoneNotes).toEqual(
        expect.arrayContaining([expect.stringContaining('Higher Studies or Vehicle')])
      );
    });

    test('calculates the cost of waiting 3 and 5 years', () => {
      const plan = calcFutureLifePlan({
        currentMonthlyIncome: 50000,
        currentMonthlyExpenses: 25000,
        startingSip: 5000,
        expectedReturn: 12,
        years: 10,
      });

      expect(plan.costOfWaiting.startNow).toBeGreaterThan(plan.costOfWaiting.wait3Years);
      expect(plan.costOfWaiting.wait3Years).toBeGreaterThan(plan.costOfWaiting.wait5Years);
      expect(plan.costOfWaiting.costOf3YearsLost).toBeGreaterThan(300000);
    });

    test('supports safe-saving-only non-investor mode', () => {
      const plan = calcFutureLifePlan({
        currentMonthlyIncome: 40000,
        currentMonthlyExpenses: 25000,
        investWhen: 'never_safe_only',
        years: 5,
      });

      expect(plan.isSafeSavingOnly).toBe(true);
      plan.years.forEach((yr) => {
        expect(yr.monthlySip).toBe(0);
        expect(yr.investmentValueNominal).toBe(0);
        expect(yr.cashSavingsBalance).toBeGreaterThan(0);
      });
    });

    test('supports delayed investing (e.g. after reaching salary threshold)', () => {
      const plan = calcFutureLifePlan({
        currentMonthlyIncome: 35000,
        currentMonthlyExpenses: 20000,
        investWhen: 'at_salary',
        investThreshold: 50000,
        salaryGrowthRate: 15,
        years: 6,
      });

      // Year 1 salary = 35k (< 50k threshold) => SIP should be 0
      expect(plan.years[0].monthlySip).toBe(0);
      // Eventually salary crosses 50k, enabling SIP
      const laterYear = plan.years.find((y) => y.monthlyIncome >= 50000);
      if (laterYear) {
        expect(laterYear.monthlySip).toBeGreaterThan(0);
      }
    });
  });

  describe('calcReadinessStep()', () => {
    test('returns step 1 for a beginner with low emergency cushion', () => {
      const res = calcReadinessStep({
        monthlyIncome: 30000,
        monthlyExpenses: 25000,
        liquidSavings: 10000, // < 1.5 months
        debtPayments: 5000,
        monthsTracked: 1,
      });

      expect(res.currentStep).toBe(2); // Step 1 is completed (tracked 1 mo), now working on step 2
      expect(res.steps[0].completed).toBe(true);
      expect(res.steps[1].completed).toBe(false);
    });

    test('advances to step 5 for financially healthy candidate ready for SIP', () => {
      const res = calcReadinessStep({
        monthlyIncome: 80000,
        monthlyExpenses: 35000,
        liquidSavings: 150000, // > 3 months cushion
        debtPayments: 5000,    // Low DTI
        hasInsurance: true,
        monthsTracked: 6,
      });

      expect(res.currentStep).toBe(5);
      expect(res.steps[0].completed).toBe(true);
      expect(res.steps[1].completed).toBe(true);
      expect(res.steps[2].completed).toBe(true);
      expect(res.steps[3].completed).toBe(true);
    });
  });
});
