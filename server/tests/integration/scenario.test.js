const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const FinancialProfile = require('../../src/models/FinancialProfile');
const Scenario = require('../../src/models/Scenario');

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
    await Scenario.deleteMany({});
    await FinancialProfile.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Scenario.deleteMany({});
  await FinancialProfile.deleteMany({});
  await User.deleteMany({});

  const email = `scenario.tester.${Date.now()}.${Math.random()}@example.com`;
  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Scenario Tester',
    email,
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  await FinancialProfile.create({
    userId,
    age: 27,
    occupationType: 'salaried',
    monthlyIncome: 60000,
    fixedExpenses: 35000,
    riskProfile: 'moderate',
    existingSavings: 50000,
    existingInvestments: 80000,
    dependents: 0,
  });
});

describe('What-If Scenario API Integration Tests', () => {
  describe('POST /api/v1/scenarios/simulate', () => {
    it('runs live simulation without saving', async () => {
      const res = await request(app)
        .post('/api/v1/scenarios/simulate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ incomeDelta: 5000, expenseCutPct: 10, sipBoost: 2000, returnRate: 12 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.simScore).toBeGreaterThan(0);
      expect(res.body.data.sim5yWealth).toBeGreaterThan(0);
      expect(res.body.data.summary).toBeDefined();
    });
  });

  describe('Scenario CRUD operations', () => {
    it('saves a scenario and retrieves it', async () => {
      const saveRes = await request(app)
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Aggressive Saving Plan',
          params: { incomeDelta: 10000, expenseCutPct: 15, sipBoost: 5000, returnRate: 12 },
        });

      expect(saveRes.status).toBe(201);
      expect(saveRes.body.success).toBe(true);
      expect(saveRes.body.data.scenario.name).toBe('Aggressive Saving Plan');

      // List scenarios
      const listRes = await request(app)
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.scenarios).toHaveLength(1);
    });

    it('enforces maximum of 3 scenarios limit', async () => {
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/api/v1/scenarios')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: `Plan ${i}`, params: {} });
      }

      // 4th should fail with 400
      const fourth = await request(app)
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Plan 4', params: {} });

      expect(fourth.status).toBe(400);
      expect(fourth.body.message).toMatch(/up to 3 scenarios/i);
    });

    it('deletes a scenario by ID', async () => {
      const save = await request(app)
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Temporary Plan', params: {} });

      const scId = save.body.data.scenario._id;

      const delRes = await request(app)
        .delete(`/api/v1/scenarios/${scId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      const listRes = await request(app)
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(listRes.body.data.scenarios).toHaveLength(0);
    });
  });
});
