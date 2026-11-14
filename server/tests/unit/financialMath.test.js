const {
  calculateSip,
  calculateCompoundInterest,
  calculateRequiredSip,
  calculateStepUpSip,
  adjustForInflation,
} = require('../../src/utils/financialMath');

describe('Financial Mathematics Unit Tests', () => {
  describe('SIP Future Value (calculateSip)', () => {
    it('should accurately calculate SIP future value for ₹5,000/mo at 12% for 10 years', () => {
      const res = calculateSip({
        monthlyAmount: 5000,
        annualRate: 12,
        years: 10,
      });

      expect(res.totalInvested).toBe(600000); // 5000 * 120
      // Expected FV for standard annuity due: ~11,61,695
      expect(res.futureValue).toBeGreaterThan(1150000);
      expect(res.futureValue).toBeLessThan(1170000);
      expect(res.wealthGain).toBe(res.futureValue - res.totalInvested);
      expect(res.yearlySchedule.length).toBe(10);
    });

    it('should handle 0% annual return rate gracefully', () => {
      const res = calculateSip({
        monthlyAmount: 2000,
        annualRate: 0,
        years: 5,
      });

      expect(res.totalInvested).toBe(120000);
      expect(res.futureValue).toBe(120000);
      expect(res.wealthGain).toBe(0);
    });

    it('should return zeros for zero investment or horizon', () => {
      const res = calculateSip({
        monthlyAmount: 0,
        annualRate: 12,
        years: 5,
      });
      expect(res.totalInvested).toBe(0);
      expect(res.futureValue).toBe(0);
    });
  });

  describe('Compound Interest (calculateCompoundInterest)', () => {
    it('should accurately compound ₹1,00,000 at 10% annually for 5 years compounded monthly', () => {
      const res = calculateCompoundInterest({
        principal: 100000,
        annualRate: 10,
        years: 5,
        compoundingFrequency: 12,
      });

      expect(res.principal).toBe(100000);
      // A = 100000 * (1 + 0.10/12)^(60) ≈ 1,64,531
      expect(res.futureValue).toBeGreaterThan(164000);
      expect(res.futureValue).toBeLessThan(165000);
      expect(res.interestEarned).toBe(res.futureValue - 100000);
      expect(res.yearlySchedule.length).toBe(5);
    });

    it('should handle 0% rate on lump sum', () => {
      const res = calculateCompoundInterest({
        principal: 50000,
        annualRate: 0,
        years: 3,
      });
      expect(res.futureValue).toBe(50000);
      expect(res.interestEarned).toBe(0);
    });
  });

  describe('Required Monthly SIP (calculateRequiredSip)', () => {
    it('should solve for required monthly installment to hit ₹10,00,000 in 10 years at 12%', () => {
      const res = calculateRequiredSip({
        targetAmount: 1000000,
        annualRate: 12,
        years: 10,
      });

      // Target 10L at 12% in 10 years requires approx ₹4,304/month
      expect(res.requiredMonthlySip).toBeGreaterThan(4200);
      expect(res.requiredMonthlySip).toBeLessThan(4400);

      // Verify that this required SIP yields approx target amount
      const verification = calculateSip({
        monthlyAmount: res.requiredMonthlySip,
        annualRate: 12,
        years: 10,
      });
      expect(verification.futureValue).toBeGreaterThanOrEqual(1000000);
    });
  });

  describe('Step-Up SIP (calculateStepUpSip)', () => {
    it('should calculate higher wealth for Step-Up SIP compared to flat SIP', () => {
      const flatSip = calculateSip({
        monthlyAmount: 10000,
        annualRate: 12,
        years: 10,
      });

      const stepUpSip = calculateStepUpSip({
        initialMonthlyAmount: 10000,
        annualRate: 12,
        years: 10,
        stepUpPercent: 10,
      });

      expect(stepUpSip.futureValue).toBeGreaterThan(flatSip.futureValue);
      expect(stepUpSip.yearlySchedule.length).toBe(10);
    });
  });

  describe('Inflation Adjustment (adjustForInflation)', () => {
    it('should discount future nominal value for inflation', () => {
      const nominal = 1000000; // 10 Lakhs in 10 years
      const real = adjustForInflation(nominal, 10, 6); // at 6% inflation

      // 10L / (1.06)^10 ≈ 5,58,395
      expect(real).toBeGreaterThan(550000);
      expect(real).toBeLessThan(570000);
    });
  });
});
