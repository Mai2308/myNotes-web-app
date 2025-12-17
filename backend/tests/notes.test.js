const request = require('supertest');
const app = require('../app');
let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/login')
    .send({ email: 'test@example.com', password: '123456' });
  token = res.body.token;
});

describe('Notes API', () => {
  let noteId;

  it('should create a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Note', content: 'Hello World' });
    expect(res.statusCode).toBe(201);
    noteId = res.body.id;
  });

  it('should edit a note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Note' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Note');
  });

  it('should lock a note', async () => {
    const res = await request(app)
      .post(`/api/notes/${noteId}/lock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: '1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.locked).toBe(true);
  });

  it('should unlock a note', async () => {
    const res = await request(app)
      .post(`/api/notes/${noteId}/unlock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: '1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.locked).toBe(false);
  });

  it('should add note to favorites', async () => {
    const res = await request(app)
      .post(`/api/notes/${noteId}/favorite`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.favorite).toBe(true);
  });

  it('should delete a note', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
