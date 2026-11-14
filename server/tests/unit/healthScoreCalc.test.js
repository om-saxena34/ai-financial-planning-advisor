const {
  interpolate,
  scoreSavingsRate,
  scoreEmergencyFund,
  scoreDebtToIncome,
  calculateHealthScore,
} = require('../../src/utils/healthScoreCalc');

describe('Financial Health Score Unit Tests', () => {
  describe('Piecewise Linear Interpolation', () => {
    const points = [
      [0, 0],
      [10, 50],
      [20, 100],
    ];

    it('should interpolate midpoints correctly', () => {
      expect(interpolate(5, points)).toBe(25);
      expect(interpolate(15, points)).toBe(75);
    });

    it('should clamp boundaries at edges', () => {
      expect(interpolate(-5, points)).toBe(0);
      expect(interpolate(30, points)).toBe(100);
    });
  });

  describe('Component Sub-scoring', () => {
    it('should score savings rate with linear scaling', () => {
      expect(scoreSavingsRate(30)).toBe(100);
      expect(scoreSavingsRate(20)).toBe(75);
      expect(scoreSavingsRate(10)).toBe(50);
      expect(scoreSavingsRate(0)).toBe(0);
      expect(scoreSavingsRate(-10)).toBe(0);
    });

    it('should score emergency fund coverage', () => {
      expect(scoreEmergencyFund(6)).toBe(100);
      expect(scoreEmergencyFund(4)).toBe(75);
      expect(scoreEmergencyFund(3)).toBe(62.5);
      expect(scoreEmergencyFund(0)).toBe(0);
    });

    it('should score debt to income (lower DTI is better)', () => {
      expect(scoreDebtToIncome(0)).toBe(100);
      expect(scoreDebtToIncome(15)).toBe(75);
      expect(scoreDebtToIncome(30)).toBe(50);
      expect(scoreDebtToIncome(60)).toBe(0);
    });
  });

  describe('Composite Health Score Calculation', () => {
    it('should calculate an Excellent score (80–100) for disciplined Saver persona', () => {
      const result = calculateHealthScore({
        monthlyIncome: 80000,
        monthlyExpenses: 40000, // 50% savings rate
        essentialExpenses: 25000,
        liquidSavings: 200000, // 8 months coverage
        debtPayments: 0,
        monthlyInvestments: 20000,
        goalProgressAvg: 85,
        goalCount: 2,
      });

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.band).toBe('Excellent');
      expect(result.components.savingsRate.score).toBe(100);
      expect(result.components.emergencyFund.score).toBe(100);
    });

    it('should calculate a Poor score (<40) for high-debt Overspender persona', () => {
      const result = calculateHealthScore({
        monthlyIncome: 40000,
        monthlyExpenses: 48000, // spending > income
        essentialExpenses: 38000,
        liquidSavings: 5000, // < 1 month
        debtPayments: 22000, // > 50% DTI
        monthlyInvestments: 0,
        goalProgressAvg: 10,
        goalCount: 1,
      });

      expect(result.score).toBeLessThan(40);
      expect(result.band).toBe('Poor');
      expect(result.color).toBe('#ef4444');
    });

    it('should handle zero income edge case gracefully without throwing', () => {
      const result = calculateHealthScore({
        monthlyIncome: 0,
        monthlyExpenses: 0,
        essentialExpenses: 0,
        liquidSavings: 0,
      });

      expect(result.score).toBe(0);
      expect(result.band).toBe('Poor');
      expect(result.summary).toContain('Add your income');
    });
  });
});
