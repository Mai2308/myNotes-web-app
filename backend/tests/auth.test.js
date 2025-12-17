const request = require('supertest');
const app = require('../app'); // Express app

describe('Authentication', () => {
  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ username: 'testuser', email: 'test@example.com', password: '123456' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@example.com', password: '123' });
    expect(res.statusCode).toBe(401);
  });
});
