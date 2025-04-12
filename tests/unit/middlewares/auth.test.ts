import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
import { authenticate, authorize } from '../../../src/middlewares/auth';
import { authService, userService } from '../../../src/services';
import ApiError from '../../../src/utils/ApiError';

// Mock dependencies
jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/services/user.service');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    req = {
      headers: {},
      user: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    it('should call next with error if Authorization header is missing', async () => {
      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should call next with error if token is missing', async () => {
      req.headers = { authorization: 'Bearer ' };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication token not provided');
    });

    it('should call next with error if token verification fails', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      (authService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new ApiError(401, 'Invalid or expired token');
      });

      await authenticate(req as Request, res as Response, next);

      expect(authService.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid or expired token');
    });

    it('should call next with error if token type is not ACCESS', async () => {
      req.headers = { authorization: 'Bearer refresh-token' };
      (authService.verifyToken as jest.Mock).mockReturnValue({
        sub: '60d0fe4f5311236168a109ca',
        type: 'REFRESH',
      });

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token type');
    });

    it('should call next with error if user is not found', async () => {
      req.headers = { authorization: 'Bearer valid-token' };
      (authService.verifyToken as jest.Mock).mockReturnValue({
        sub: '60d0fe4f5311236168a109ca',
        type: 'ACCESS',
      });
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await authenticate(req as Request, res as Response, next);

      expect(userService.getUserById).toHaveBeenCalledWith(
        '60d0fe4f5311236168a109ca'
      );
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('User not found');
    });

    it('should attach user to request and call next if token is valid', async () => {
      const mockUser = { _id: '60d0fe4f5311236168a109ca', name: 'Test User' };
      req.headers = { authorization: 'Bearer valid-token' };
      (authService.verifyToken as jest.Mock).mockReturnValue({
        sub: '60d0fe4f5311236168a109ca',
        type: 'ACCESS',
      });
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(req as Request, res as Response, next);

      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('authorize middleware', () => {
    it('should call next with error if user is not authenticated', () => {
      const authorizeMiddleware = authorize(['admin']);

      authorizeMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Please authenticate');
    });

    it('should call next with error if user does not have required role', () => {
      const authorizeMiddleware = authorize(['admin']);
      req.user = { role: 'user' } as any;

      authorizeMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden: Insufficient permissions');
    });

    it('should call next if user has required role', () => {
      const authorizeMiddleware = authorize(['admin']);
      req.user = { role: 'admin' } as any;

      authorizeMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next if empty role array is provided', () => {
      const authorizeMiddleware = authorize([]);
      req.user = { role: 'user' } as any;

      authorizeMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
