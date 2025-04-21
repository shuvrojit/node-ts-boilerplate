import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../src/app';
import { User } from '../../../src/models';
import { authService } from '../../../src/services';
import { Request, Response, NextFunction } from 'express';

// Mock the models
jest.mock('../../../src/models', () => {
  const originalModule = jest.requireActual('../../../src/models');

  return {
    ...originalModule,
    User: {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    },
  };
});

// Mock the auth middleware
jest.mock('../../../src/middlewares/auth', () => ({
  authenticate: (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: 'mock-user-id', role: 'admin' } as any; // Cast to any for mock
    next();
  },
  authorize: () => (_req: Request, _res: Response, next: NextFunction) => {
    // Added underscores
    next();
  },
}));

jest.mock('../../../src/services/auth.service', () => {
  const originalModule = jest.requireActual(
    '../../../src/services/auth.service'
  );

  return {
    ...originalModule,
    verifyToken: jest.fn(),
  };
});

describe('User Routes', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const mockUser = {
    _id: userId,
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin', // Changed from 'user' to 'admin' to pass authorization checks
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithPassword = {
    ...mockUser,
    password: 'password123',
  };

  const mockTokenPayload = {
    sub: userId,
    type: 'ACCESS',
  };

  beforeEach(() => {
    (authService.verifyToken as jest.Mock).mockReturnValue(mockTokenPayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      // Mock User.findOne to return null (email doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);
      // Mock User.create to return mockUser
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123@',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual(
        expect.objectContaining({
          name: mockUser.name,
          email: mockUser.email,
        })
      );
    });

    it('should return validation error for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'T', // Too short (validation should fail)
          email: 'invalid-email',
          password: 'short', // Too short (validation should fail)
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain(
        'name - String must contain at least 3 character(s)'
      );
      expect(res.body.message).toContain('email - Invalid email');
      expect(res.body.message).toContain(
        'password - String must contain at least 8 character(s)'
      );
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    it('should return a user by ID', async () => {
      // Mock User.findById to return mockUser
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: userId,
          name: mockUser.name,
          email: mockUser.email,
        })
      );
    });

    it('should return 404 for non-existent user', async () => {
      // Mock User.findById to return null
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return validation error for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Invalid MongoDB ID');
    });
  });

  describe('PATCH /api/v1/users/:userId', () => {
    it('should update a user', async () => {
      // Mock User.findById to return mockUser
      (User.findById as jest.Mock).mockResolvedValue({
        ...mockUserWithPassword,
        save: jest.fn().mockResolvedValue({
          ...mockUser,
          name: 'Updated Name',
        }),
      });

      const res = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Updated Name',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual(
        expect.objectContaining({
          name: 'Updated Name',
        })
      );
    });
  });

  describe('DELETE /api/v1/users/:userId', () => {
    it('should delete a user', async () => {
      // Mock User.findById to return mockUser with deleteOne method
      (User.findById as jest.Mock).mockResolvedValue({
        ...mockUserWithPassword,
        deleteOne: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(204);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should get users with pagination', async () => {
      const mockUsers = [
        mockUser,
        { ...mockUser, _id: new mongoose.Types.ObjectId().toString() },
      ];

      // Mock User.find to return mockUsers
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers),
      });

      // Mock User.countDocuments to return count
      (User.countDocuments as jest.Mock).mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveLength(2);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      });
    });

    it('should filter users based on query parameters', async () => {
      // Mock User.find to return filtered mockUsers
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      });

      // Mock User.countDocuments to return count
      (User.countDocuments as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer valid-token')
        .query({
          name: 'Test',
          role: 'user',
          page: '1',
          limit: '10',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveLength(1);
      expect(User.find).toHaveBeenCalled();
    });
  });
});
