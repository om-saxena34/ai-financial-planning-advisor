const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Goal = require('../../src/models/Goal');
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
    await Goal.deleteMany({});
    await FinancialProfile.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Goal.deleteMany({});
  await FinancialProfile.deleteMany({});
  await User.deleteMany({});

  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Goal Tester',
    email: 'goal.tester@example.com',
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  await FinancialProfile.create({
    userId,
    age: 26,
    occupationType: 'salaried',
    monthlyIncome: 80000,
    fixedExpenses: 30000,
    riskProfile: 'moderate',
    existingSavings: 100000,
    existingInvestments: 150000,
    dependents: 0,
  });
});

describe('Goal-Based Planning Integration Tests', () => {
  it('should create a goal and compute required SIP', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 3);

    const res = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Master Degree',
        type: 'education',
        targetAmount: 500000,
        currentAmount: 50000,
        targetDate: futureDate.toISOString(),
        expectedReturnRate: 12,
        priority: 'high',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Master Degree');
    expect(res.body.data.requiredMonthlySIP).toBeGreaterThan(0);
    expect(res.body.data.feasibility).toBeDefined();
    expect(res.body.data.feasibility.isOnTrack).toBe(true);
  });

  it('should list all goals with progress percentages', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Emergency Buffer',
        type: 'emergency_fund',
        targetAmount: 100000,
        currentAmount: 50000,
        targetDate: futureDate.toISOString(),
      });

    const res = await request(app)
      .get('/api/v1/goals')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].progressPercent).toBe(50);
  });

  it('should accept contributions towards a goal and auto-complete when target is met', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const created = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Laptop',
        type: 'custom',
        targetAmount: 80000,
        currentAmount: 70000,
        targetDate: futureDate.toISOString(),
      });

    const goalId = created.body.data._id;

    // Contribute ₹15,000 (total ₹85,000 > ₹80,000 target)
    const res = await request(app)
      .post(`/api/v1/goals/${goalId}/contribute`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 15000 });

    expect(res.status).toBe(200);
    expect(res.body.data.currentAmount).toBe(85000);
    expect(res.body.data.status).toBe('completed');
  });

  it('should delete a goal successfully', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const created = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Temporary Goal',
        type: 'travel',
        targetAmount: 20000,
        currentAmount: 0,
        targetDate: futureDate.toISOString(),
      });

    const goalId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/v1/goals/${goalId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await Goal.findById(goalId);
    expect(check).toBeNull();
  });
});
