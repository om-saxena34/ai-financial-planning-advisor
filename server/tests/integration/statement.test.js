const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const FinancialProfile = require('../../src/models/FinancialProfile');
const UploadBatch = require('../../src/models/UploadBatch');
const CategoryRule = require('../../src/models/CategoryRule');
const Transaction = require('../../src/models/Transaction');

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
    await UploadBatch.deleteMany({});
    await CategoryRule.deleteMany({});
    await Transaction.deleteMany({});
    await FinancialProfile.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await UploadBatch.deleteMany({});
  await CategoryRule.deleteMany({});
  await Transaction.deleteMany({});
  await FinancialProfile.deleteMany({});
  await User.deleteMany({});

  const email = `statement.tester.${Date.now()}.${Math.random()}@example.com`;
  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Statement Tester',
    email,
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user.id || reg.body.data.user._id;

  await FinancialProfile.create({
    userId,
    age: 24,
    occupationType: 'student',
    monthlyIncome: 20000,
    fixedExpenses: 12000,
    riskProfile: 'moderate',
    existingSavings: 15000,
    existingInvestments: 5000,
    dependents: 0,
  });
});

describe('Statement Upload API Integration Tests', () => {
  describe('POST /api/v1/statement/upload', () => {
    it('parses CSV in memory, assigns categories, and returns review items', async () => {
      const csvContent =
        'Date,Description,Amount,Type\n' +
        '2026-11-01,Swiggy Bangalore,450,Debit\n' +
        '2026-11-02,Uber India Ride,220,Debit\n' +
        '2026-11-03,College Semester Fee,25000,Debit\n';

      const res = await request(app)
        .post('/api/v1/statement/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('statement', Buffer.from(csvContent, 'utf-8'), 'statement.csv');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rows).toHaveLength(3);
      expect(res.body.data.batchId).toBeDefined();

      const categories = res.body.data.rows.map((r) => r.category);
      expect(categories).toContain('Food & Dining');
      expect(categories).toContain('Transport');
    });

    it('rejects upload without file attached', async () => {
      const res = await request(app)
        .post('/api/v1/statement/upload')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/statement/correct & confirm', () => {
    it('saves user correction rule and confirms transactions to DB', async () => {
      // 1. Save rule
      const correctRes = await request(app)
        .post('/api/v1/statement/correct')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ keyword: 'canteen', category: 'Food & Dining' });

      expect(correctRes.status).toBe(200);
      expect(correctRes.body.success).toBe(true);

      const rule = await CategoryRule.findOne({ userId, keyword: 'canteen' });
      expect(rule).not.toBeNull();
      expect(rule.assignedCategory).toBe('Food & Dining');

      // 2. Confirm transactions
      const batch = await UploadBatch.create({
        userId,
        fileName: 'test.csv',
        rowCount: 1,
        status: 'pending',
      });

      const confirmRes = await request(app)
        .post('/api/v1/statement/confirm')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          batchId: batch._id,
          rows: [
            {
              description: 'Campus Canteen Lunch',
              amount: 120,
              type: 'debit',
              category: 'Food & Dining',
              dateStr: new Date().toISOString(),
            },
          ],
        });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.added).toBe(1);

      // Verify transaction inserted
      const tx = await Transaction.findOne({ userId, note: 'Campus Canteen Lunch' });
      expect(tx).not.toBeNull();
      expect(tx.category).toBe('Food & Dining');
    });
  });
});
