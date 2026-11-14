const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const FinancialProfile = require('../../src/models/FinancialProfile');
const Recommendation = require('../../src/models/Recommendation');

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
    await Recommendation.deleteMany({});
    await FinancialProfile.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Recommendation.deleteMany({});
  await FinancialProfile.deleteMany({});
  await User.deleteMany({});

  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Rec Tester',
    email: 'rec.tester@example.com',
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  // Profile with low emergency savings (< 3 months fixed expenses)
  await FinancialProfile.create({
    userId,
    age: 24,
    occupationType: 'salaried',
    monthlyIncome: 60000,
    fixedExpenses: 30000, // 3 months = 90k
    riskProfile: 'moderate',
    existingSavings: 20000, // < 90k -> triggers RULE_EMERGENCY_FUND_LOW
    existingInvestments: 10000,
    dependents: 0,
  });
});

describe('Recommendation Engine Integration Tests', () => {
  it('should generate explainable recommendations for low emergency cushion', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const emergencyRec = res.body.data.find(
      (r) => r.ruleId === 'RULE_EMERGENCY_FUND_LOW'
    );
    expect(emergencyRec).toBeDefined();
    expect(emergencyRec.priority).toBe('high');
    expect(emergencyRec.reasoning).toBeDefined();
  });

  it('should update recommendation status (e.g. dismissed or applied)', async () => {
    const genRes = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${accessToken}`);

    const recId = genRes.body.data[0]._id;

    const patchRes = await request(app)
      .patch(`/api/v1/recommendations/${recId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'applied' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('applied');
  });
});
