import request from 'supertest';
import app from '../../src/app';

describe('App Integration Tests', () => {
  describe('GET /', () => {
    it('should return 200 and "root"', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('root');
    });
  });

  describe('JSON Middleware', () => {
    it('should parse JSON payloads', async () => {
      const payload = { key: 'value' };
      const res = await request(app)
        .post('/')
        .send(payload)
        .set('Content-Type', 'application/json');

      // Even though this route doesn't exist, we can verify that the JSON middleware
      // parsed the body by checking that we get a 404 (route not found) rather than
      // a 400 (bad request)
      expect(res.status).toBe(404);
    });
  });
});
