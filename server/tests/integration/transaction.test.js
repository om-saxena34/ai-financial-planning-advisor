const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
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
    await Transaction.deleteMany({});
    await User.deleteMany({});
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Transaction.deleteMany({});
  await User.deleteMany({});

  // Register and get token
  const reg = await request(app).post('/api/v1/auth/register').send({
    name: 'Transaction Tester',
    email: 'tester@example.com',
    password: 'Password@123',
  });

  accessToken = reg.body.data.accessToken;
  userId = reg.body.data.user._id;
});

describe('Transaction Management Integration Tests', () => {
  describe('POST /api/v1/transactions', () => {
    it('should create an expense transaction successfully', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'expense',
          category: 'food',
          amount: 1250,
          note: 'Dinner at cafe',
          paymentMethod: 'upi',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction.amount).toBe(1250);
      expect(res.body.data.transaction.category).toBe('food');
    });

    it('should reject transaction with negative or zero amount', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'expense',
          category: 'food',
          amount: -50,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/transactions & Summary', () => {
    beforeEach(async () => {
      await Transaction.create([
        {
          userId,
          type: 'income',
          category: 'salary',
          amount: 60000,
          date: new Date(),
          note: 'Monthly salary',
        },
        {
          userId,
          type: 'expense',
          category: 'rent',
          amount: 18000,
          date: new Date(),
          note: 'House rent',
        },
        {
          userId,
          type: 'expense',
          category: 'food',
          amount: 6000,
          date: new Date(),
          note: 'Groceries and dining',
        },
        {
          userId,
          type: 'expense',
          category: 'entertainment',
          amount: 3000,
          date: new Date(),
          note: 'Movie night & games',
        },
      ]);
    });

    it('should list transactions with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/transactions?limit=2&page=1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(4);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter transactions by type and category', async () => {
      const res = await request(app)
        .get('/api/v1/transactions?type=expense&category=rent')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].amount).toBe(18000);
    });

    it('should search transactions by note text', async () => {
      const res = await request(app)
        .get('/api/v1/transactions?search=Movie')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('entertainment');
    });

    it('should calculate accurate monthly summary, ratios, and category breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/transactions/summary')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      const summary = res.body.data.summary;
      expect(summary.totalIncome).toBe(60000);
      expect(summary.totalExpense).toBe(27000); // 18000 + 6000 + 3000
      expect(summary.netSavings).toBe(33000);
      expect(summary.savingsRate).toBe(55); // (33000 / 60000) * 100 = 55%
      expect(summary.essentialExpenses).toBe(24000); // rent (18000) + food (6000)
      expect(summary.discretionaryExpenses).toBe(3000); // entertainment
      expect(summary.categoryBreakdown.length).toBe(3);
    });
  });

  describe('CSV Import & Export', () => {
    it('should import valid CSV transactions', async () => {
      const csvContent =
        'Date,Type,Category,Amount,PaymentMethod,Note\n' +
        '2026-11-01,expense,food,450,upi,Lunch with friends\n' +
        '2026-11-02,expense,transport,120,metro,Metro commute\n' +
        '2026-11-03,income,freelance,15000,bank_transfer,Landing page project';

      const res = await request(app)
        .post('/api/v1/transactions/import')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ csv: csvContent });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.importedCount).toBe(3);

      const count = await Transaction.countDocuments({ userId });
      expect(count).toBe(3);
    });

    it('should export transactions to CSV format', async () => {
      await Transaction.create({
        userId,
        type: 'expense',
        category: 'utilities',
        amount: 1800,
        note: 'Electricity bill',
      });

      const res = await request(app)
        .get('/api/v1/transactions/export')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('utilities');
      expect(res.text).toContain('1800');
    });
  });
});
