const request = require('supertest');
const app = require('../../src/app');

describe('Server Baseline Health & Routing API', () => {
  it('GET / should return 200 and API metadata', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('FinWise API');
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/v1/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('finwise-server');
  });

  it('GET /api/v1/non-existent-endpoint should return 404 ApiError structure', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
