const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const FinancialProfile = require('../../src/models/FinancialProfile');
const LifePlan = require('../../src/models/LifePlan');

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
    await LifePlan.deleteMany({});
    await FinancialProfile.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await LifePlan.deleteMany({});
  await FinancialProfile.deleteMany({});
  await User.deleteMany({});

  const email = `plan.tester.${Date.now()}.${Math.random()}@example.com`;
  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Plan Tester',
    email,
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  await FinancialProfile.create({
    userId,
    age: 24,
    monthlyIncome: 60000,
    fixedExpenses: 35000,
    existingSavings: 40000,
    existingInvestments: 10000,
  });
});

describe('Future Life Plan API Integration Tests', () => {
  test('POST /api/v1/plan/future/project returns 10-year projection', async () => {
    const res = await request(app)
      .post('/api/v1/plan/future/project')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentIncome: 60000,
        currentExpenses: 35000,
        startingSip: 5000,
        timelineYears: 10,
        comfortLevel: 'growth',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timelineYears).toBe(10);
    expect(res.body.data.years).toHaveLength(10);
    expect(res.body.data.costOfWaiting).toBeDefined();
    expect(res.body.data.scenarioRange).toBeDefined();
  });

  test('GET /api/v1/plan/future/readiness returns 5-step ladder', async () => {
    const res = await request(app)
      .get('/api/v1/plan/future/readiness')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.steps).toHaveLength(5);
    expect(res.body.data.currentStep).toBeGreaterThanOrEqual(1);
    expect(res.body.data.currentStep).toBeLessThanOrEqual(5);
  });

  test('POST /api/v1/plan/future/save saves plan and GET /api/v1/plan/future/saved retrieves it', async () => {
    const saveRes = await request(app)
      .post('/api/v1/plan/future/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'My 10-Year Growth Plan',
        comfortLevel: 'growth',
        startingSip: 6000,
        timelineYears: 10,
        salaryMilestones: [{ year: 3, salary: 90000, note: 'Senior Engineer promo' }],
        lifeEvents: [{ year: 4, name: 'EV Scooter', amount: 120000 }],
        summary: { finalNominal: 3500000, finalReal: 2100000, readinessStep: 4 },
      });

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.success).toBe(true);
    expect(saveRes.body.data.title).toBe('My 10-Year Growth Plan');

    const getRes = await request(app)
      .get('/api/v1/plan/future/saved')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.title).toBe('My 10-Year Growth Plan');
    expect(getRes.body.data.salaryMilestones).toHaveLength(1);
    expect(getRes.body.data.lifeEvents).toHaveLength(1);
  });
});
