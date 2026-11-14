const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const FinancialProfile = require('../../src/models/FinancialProfile');
const PredictionLog = require('../../src/models/PredictionLog');
const mlClient = require('../../src/services/mlClient.service');

const TEST_DB_URI =
  process.env.MONGODB_TEST_URI ||
  'mongodb://127.0.0.1:27017/financial_advisor_test';

let accessToken;
let userId;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  try {
    await PredictionLog.deleteMany({});
    await FinancialProfile.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await PredictionLog.deleteMany({});
  await FinancialProfile.deleteMany({});
  await User.deleteMany({});

  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Prediction Tester',
    email: 'pred.tester@example.com',
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  // Create financial profile for the user
  await FinancialProfile.create({
    userId,
    age: 28,
    occupationType: 'salaried',
    monthlyIncome: 75000,
    fixedExpenses: 25000,
    riskProfile: 'moderate',
    existingSavings: 150000,
    existingInvestments: 200000,
    dependents: 1,
  });
});

describe('ML Prediction & Fallback Engine Integration Tests', () => {
  describe('Rule-Based Fallback Mechanics', () => {
    it('should correctly classify a high saver via fallback rules', () => {
      const fallbackResult = mlClient.getFallbackClassification({
        savings_rate: 0.45,
        discretionary_expense_ratio: 0.2,
        debt_to_income: 0.05,
      });

      expect(fallbackResult.predicted_class).toBe('Saver');
      expect(fallbackResult.source).toBe('fallback_rule_engine');
      expect(fallbackResult.probabilities.Saver).toBeGreaterThan(0.5);
    });

    it('should correctly classify an overspender via fallback rules', () => {
      const fallbackResult = mlClient.getFallbackClassification({
        savings_rate: 0.05,
        discretionary_expense_ratio: 0.55,
        debt_to_income: 0.5,
      });

      expect(fallbackResult.predicted_class).toBe('Overspender');
      expect(fallbackResult.probabilities.Overspender).toBeGreaterThan(0.5);
    });

    it('should compute valid 12-month savings and 5-year wealth forecast via fallback', () => {
      const forecast = mlClient.getFallbackForecast({
        monthly_income: 80000,
        total_expenses: 50000,
        existing_savings: 100000,
        existing_investments: 200000,
        expected_return_rate: 10,
      });

      expect(forecast.predicted_savings_12m).toBe(100000 + 30000 * 12);
      expect(forecast.predicted_wealth_5y).toBeGreaterThan(forecast.predicted_savings_12m);
      expect(forecast.confidence_band.lower_bound).toBeLessThan(forecast.predicted_wealth_5y);
      expect(forecast.confidence_band.upper_bound).toBeGreaterThan(forecast.predicted_wealth_5y);
    });
  });

  describe('POST /api/v1/predictions/classify', () => {
    it('should classify user without crashing even if ML service is offline (fallback resilience)', async () => {
      const res = await request(app)
        .post('/api/v1/predictions/classify')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.predicted_class).toBeDefined();
      expect(['Saver', 'Balanced', 'Overspender']).toContain(res.body.data.predicted_class);
      expect(res.body.data.probabilities).toBeDefined();

      // Check log persistence
      const logs = await PredictionLog.find({ userId, type: 'classification' });
      expect(logs.length).toBe(1);
    });

    it('should classify with manual features payload (what-if mode)', async () => {
      const manualFeatures = {
        age: 24,
        monthly_income: 90000,
        total_expenses: 30000,
        savings_rate: 0.66,
        essential_expense_ratio: 0.6,
        discretionary_expense_ratio: 0.4,
        food_ratio: 0.2,
        entertainment_ratio: 0.1,
        shopping_ratio: 0.1,
        debt_to_income: 0.0,
        emergency_fund_months: 6.0,
        investment_ratio: 0.2,
        dependents: 0,
        risk_profile: 1,
      };

      const res = await request(app)
        .post('/api/v1/predictions/classify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(manualFeatures);

      expect(res.status).toBe(200);
      expect(res.body.data.predicted_class).toBeDefined();
    });
  });

  describe('POST /api/v1/predictions/forecast', () => {
    it('should generate financial forecast and log to database', async () => {
      const res = await request(app)
        .post('/api/v1/predictions/forecast')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.predicted_savings_12m).toBeGreaterThan(0);
      expect(res.body.data.predicted_wealth_5y).toBeGreaterThan(0);
      expect(res.body.data.confidence_band).toBeDefined();

      const logs = await PredictionLog.find({ userId, type: 'forecast' });
      expect(logs.length).toBe(1);
    });
  });

  describe('GET /api/v1/predictions/history', () => {
    it('should retrieve prediction logs for the authenticated user', async () => {
      // Create one classification and one forecast
      await request(app)
        .post('/api/v1/predictions/classify')
        .set('Authorization', `Bearer ${accessToken}`);

      await request(app)
        .post('/api/v1/predictions/forecast')
        .set('Authorization', `Bearer ${accessToken}`);

      const res = await request(app)
        .get('/api/v1/predictions/history')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('GET /api/v1/ml-metrics', () => {
    it('should return model metrics without throwing an error', async () => {
      const res = await request(app).get('/api/v1/ml-metrics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.classifier).toBeDefined();
      expect(res.body.data.regressor).toBeDefined();
    });
  });
});
