const {
  median,
  calcEffectiveIncome,
  firstSalarySplit,
  semesterFeePlan,
  calculateHealthScore,
} = require('../../../shared/financialCalc');

describe('Student Mode Financial Calculations', () => {
  describe('median()', () => {
    it('returns 0 for empty array', () => {
      expect(median([])).toBe(0);
    });

    it('calculates median for odd-length array', () => {
      expect(median([1000, 3000, 2000])).toBe(2000);
    });

    it('calculates median for even-length array', () => {
      expect(median([1000, 2000, 3000, 4000])).toBe(2500);
    });
  });

  describe('calcEffectiveIncome()', () => {
    it('handles mixed fixed and irregular income streams', () => {
      const sources = [
        { label: 'Pocket money', amount: 5000, isIrregular: false },
        { label: 'Internship', amount: 15000, isIrregular: false },
        { label: 'Freelance Jan', amount: 4000, isIrregular: true },
        { label: 'Freelance Feb', amount: 8000, isIrregular: true },
        { label: 'Freelance Mar', amount: 6000, isIrregular: true },
      ];
      // Fixed: 5000 + 15000 = 20000
      // Irregular median of [4000, 6000, 8000] = 6000
      // Total effective = 26000
      expect(calcEffectiveIncome(sources)).toBe(26000);
    });

    it('returns 0 when sources empty', () => {
      expect(calcEffectiveIncome([])).toBe(0);
    });
  });

  describe('firstSalarySplit()', () => {
    it('computes 50/30/20 breakdown with Indian rent and emergency fund targets', () => {
      const plan = firstSalarySplit(40000, 'tier1');
      expect(plan).not.toBeNull();
      expect(plan.salary).toBe(40000);
      expect(plan.needs).toBe(20000); // 50%
      expect(plan.wants).toBe(12000); // 30%
      expect(plan.savings).toBe(8000); // 20%
      expect(plan.rent).toBe(10000); // 25% for tier1
      expect(plan.emergencyTarget).toBe(60000); // 3 months of needs
      expect(plan.startingSip).toBe(4000); // 50% of savings
      expect(plan.emergencyMonthly).toBe(4000); // 50% of savings
      expect(plan.monthsToEmergency).toBe(15);
      expect(plan.sipFv1y).toBeGreaterThan(48000);
      expect(plan.sipFv5y).toBeGreaterThan(plan.sipFv1y);
    });

    it('returns null for zero or negative salary', () => {
      expect(firstSalarySplit(0)).toBeNull();
      expect(firstSalarySplit(-1000)).toBeNull();
    });
  });

  describe('semesterFeePlan()', () => {
    it('calculates monthly savings needed before fee due date', () => {
      const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // ~3 months
      const plan = semesterFeePlan(30000, futureDate, 6000);
      expect(plan).not.toBeNull();
      expect(plan.feeAmount).toBe(30000);
      expect(plan.currentSavings).toBe(6000);
      expect(plan.remaining).toBe(24000);
      expect(plan.monthsLeft).toBeGreaterThanOrEqual(2);
      expect(plan.monthlyNeeded).toBeGreaterThan(0);
    });
  });

  describe('calculateHealthScore() with student target', () => {
    it('adapts emergency fund target to 3 months for students', () => {
      const standardScore = calculateHealthScore({
        monthlyIncome: 30000,
        monthlyExpenses: 20000,
        essentialExpenses: 12000,
        liquidSavings: 36000, // 3 months of essential
        emergencyFundTarget: 6, // normal
      });

      const studentScore = calculateHealthScore({
        monthlyIncome: 30000,
        monthlyExpenses: 20000,
        essentialExpenses: 12000,
        liquidSavings: 36000, // 3 months of essential
        emergencyFundTarget: 3, // student mode
      });

      // Student gets higher score for 3 months savings because their target is 3 months
      expect(studentScore.components.emergencyFund.score).toBeGreaterThan(
        standardScore.components.emergencyFund.score
      );
    });
  });
});
