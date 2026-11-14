const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

const TEST_DB_URI =
  process.env.MONGODB_TEST_URI ||
  'mongodb://127.0.0.1:27017/financial_advisor_test';

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  } finally {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Authentication & Profile Integration Tests', () => {
  const testUser = {
    name: 'Om Sharma',
    email: 'om.sharma@example.com',
    password: 'Password@123',
    currency: 'INR',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return access token & set cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      const userInDb = await User.findOne({ email: testUser.email });
      expect(userInDb).not.toBeNull();
      expect(userInDb.passwordHash).not.toBe(testUser.password); // must be hashed
    });

    it('should reject registration if email is already taken', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration if validation fails (e.g. invalid email / short password)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'O',
        email: 'invalid-email',
        password: '123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me & Refresh Flow', () => {
    let accessToken;
    let cookie;

    beforeEach(async () => {
      const reg = await request(app).post('/api/v1/auth/register').send(testUser);
      accessToken = reg.body.data.accessToken;
      cookie = reg.headers['set-cookie'];
    });

    it('should get current user with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should refresh access token using cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('PUT & GET /api/v1/profile', () => {
    let accessToken;

    beforeEach(async () => {
      const reg = await request(app).post('/api/v1/auth/register').send(testUser);
      accessToken = reg.body.data.accessToken;
    });

    it('should create and retrieve a financial profile', async () => {
      const profileData = {
        age: 24,
        occupationType: 'salaried',
        monthlyIncome: 65000,
        fixedExpenses: 25000,
        riskProfile: 'moderate',
        existingSavings: 50000,
        existingInvestments: 20000,
        dependents: 0,
      };

      const putRes = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(profileData);

      expect(putRes.statusCode).toBe(200);
      expect(putRes.body.data.profile.monthlyIncome).toBe(65000);
      expect(putRes.body.data.profile.riskProfile).toBe('moderate');

      // Check onboardingComplete marked true on user
      const userRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(userRes.body.data.user.onboardingComplete).toBe(true);

      // GET profile
      const getRes = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.data.profile.age).toBe(24);
    });
  });
});
