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

  const email = `student.tester.${Date.now()}.${Math.random()}@example.com`;
  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Student Tester',
    email,
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  await FinancialProfile.create({
    userId,
    age: 21,
    occupationType: 'student',
    monthlyIncome: 12000,
    fixedExpenses: 7000,
    riskProfile: 'moderate',
    existingSavings: 15000,
    existingInvestments: 2000,
    dependents: 0,
    expectedFirstSalary: 45000,
    incomeSources: [
      { label: 'Pocket money', type: 'pocket_money', amount: 5000, isIrregular: false },
      { label: 'Internship', type: 'internship', amount: 7000, isIrregular: false },
    ],
    semesterFees: [
      {
        label: 'Fall Sem 2026',
        amount: 30000,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        savedSoFar: 6000,
      },
    ],
  });
});

describe('Student Mode API Integration Tests', () => {
  describe('GET /api/v1/student/semester-plan', () => {
    it('returns calculated semester plan for the logged-in student', async () => {
      const res = await request(app)
        .get('/api/v1/student/semester-plan')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.effectiveIncome).toBe(12000);
      expect(res.body.data.plans).toHaveLength(1);
      expect(res.body.data.plans[0].feeAmount).toBe(30000);
      expect(res.body.data.plans[0].remaining).toBe(24000);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/api/v1/student/semester-plan');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/student/first-salary', () => {
    it('generates 50-30-20 salary split and emergency fund targets', async () => {
      const res = await request(app)
        .post('/api/v1/student/first-salary')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ salary: 50000, city: 'tier1' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const plan = res.body.data.plan;
      expect(plan.salary).toBe(50000);
      expect(plan.needs).toBe(25000);
      expect(plan.wants).toBe(15000);
      expect(plan.savings).toBe(10000);
      expect(plan.emergencyTarget).toBe(75000); // 3x needs
      expect(plan.startingSip).toBe(5000);
    });

    it('falls back to expectedFirstSalary in profile when salary omitted', async () => {
      const res = await request(app)
        .post('/api/v1/student/first-salary')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.data.plan.salary).toBe(45000);
    });
  });

  describe('POST /api/v1/student/semester-plan', () => {
    it('saves updated semester fee schedules', async () => {
      const newFees = [
        {
          label: 'Final Sem Fee',
          amount: 35000,
          dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          savedSoFar: 10000,
        },
      ];

      const res = await request(app)
        .post('/api/v1/student/semester-plan')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ fees: newFees });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.semesterFees).toHaveLength(1);
      expect(res.body.data.profile.semesterFees[0].amount).toBe(35000);
    });
  });
});
