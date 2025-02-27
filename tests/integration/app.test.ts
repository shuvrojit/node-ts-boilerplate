// Mock the config module before other imports
jest.mock('../../src/config/config');

import request from 'supertest';
import app from '../../src/app';
import ApiError from '../../src/utils/ApiError';

describe('App', () => {
  describe('GET /', () => {
    it('should return 200 and root message', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('root');
    });
  });

  describe('Error Handling', () => {
    it('should handle not found error', async () => {
      const res = await request(app).get('/not-found');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        status: 'error',
        message: expect.any(String),
      });
    });

    it('should convert non-ApiError to ApiError', async () => {
      // Create a test route that throws a regular Error
      app.get('/error', () => {
        throw new Error('Test error');
      });

      const res = await request(app).get('/error');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: 'error',
        message: 'Test error',
      });
    });

    it('should handle operational ApiError', async () => {
      // Create a test route that throws an operational ApiError
      app.get('/api-error', () => {
        throw new ApiError(400, 'Bad request error');
      });

      const res = await request(app).get('/api-error');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: 'error',
        message: 'Bad request error',
      });
    });
  });
});
