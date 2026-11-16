const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const FinancialProfile = require('../../src/models/FinancialProfile');

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
    await FinancialProfile.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await FinancialProfile.deleteMany({});
  await User.deleteMany({});

  const email = `explain.tester.${Date.now()}.${Math.random()}@example.com`;
  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Explain Tester',
    email,
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  await FinancialProfile.create({
    userId,
    age: 25,
    occupationType: 'salaried',
    monthlyIncome: 50000,
    fixedExpenses: 28000,
    riskProfile: 'moderate',
    existingSavings: 40000,
    existingInvestments: 30000,
    dependents: 0,
  });
});

describe('Why? Explainer API Integration Tests', () => {
  describe('GET /api/v1/explain/score', () => {
    it('returns score breakdown with pillar explanations and easiest win', async () => {
      const res = await request(app)
        .get('/api/v1/explain/score')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBeGreaterThan(0);
      expect(res.body.data.explanations).toHaveLength(6);
      expect(res.body.data.easiestWin).toBeDefined();
      expect(typeof res.body.data.easiestWin).toBe('string');
    });
  });

  describe('POST /api/v1/explain/recommendation', () => {
    it('returns plain-language explanation of a recommendation', async () => {
      const rec = {
        title: 'Start an emergency fund',
        trigger: 'Liquid savings cover less than 3 months of expenses',
        rule: 'Emergency Fund Pillar Rule',
        expectedImpact: 'Improves emergency fund score from 25 to 75',
      };

      const res = await request(app)
        .post('/api/v1/explain/recommendation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(rec);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(rec.title);
      expect(res.body.data.dataUsed).toBe(rec.trigger);
      expect(res.body.data.synthetic).toBe(false);
    });
  });
});
