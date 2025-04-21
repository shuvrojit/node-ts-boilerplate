import { Request, NextFunction } from 'express';
import { jest } from '@jest/globals';
import { authenticate, authorize } from '../../../src/middlewares/auth';
import { authService, userService } from '../../../src/services';
import ApiError from '../../../src/utils/ApiError';
import { IUser } from '../../../src/models'; // Import IUser

// Mock dependencies
jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/services/user.service');

// Explicitly type the mock for userService.getUserById
const mockGetUserById = userService.getUserById as jest.MockedFunction<
  typeof userService.getUserById
>;

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  // Use jest.Mock for Response properties
  let res: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let next: jest.Mock<NextFunction>; // Changed back to jest.Mock

  beforeEach(() => {
    req = {
      headers: {},
      user: undefined,
    };
    // Assign Jest mocks directly
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // Helper to safely check ApiError properties
  const checkApiError = (error: any, statusCode: number, message: string) => {
    expect(error).toBeInstanceOf(ApiError);
    if (error instanceof ApiError) {
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
    }
  };

  describe('authenticate middleware', () => {
    it('should call next with error if Authorization header is missing', async () => {
      // Use res as any and next as any to bypass strict type checks
      await authenticate(req as Request, res as any, next as any);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      checkApiError(next.mock.calls[0][0], 401, 'Authentication required');
    });

    it('should call next with error if token is missing', async () => {
      req.headers = { authorization: 'Bearer ' };
      await authenticate(req as Request, res as any, next as any); // Use res/next as any
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      checkApiError(
        next.mock.calls[0][0],
        401,
        'Authentication token not provided'
      );
    });

    it('should call next with error if token verification fails', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      (authService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new ApiError(401, 'Invalid or expired token');
      });

      await authenticate(req as Request, res as any, next as any); // Use res/next as any

      expect(authService.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      checkApiError(next.mock.calls[0][0], 401, 'Invalid or expired token');
    });

    it('should call next with error if token type is not ACCESS', async () => {
      req.headers = { authorization: 'Bearer refresh-token' };
      (authService.verifyToken as jest.Mock).mockReturnValue({
        sub: '60d0fe4f5311236168a109ca',
        type: 'REFRESH',
      });

      await authenticate(req as Request, res as any, next as any); // Use res/next as any

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      checkApiError(next.mock.calls[0][0], 401, 'Invalid token type');
    });

    it('should call next with error if user is not found', async () => {
      req.headers = { authorization: 'Bearer valid-token' };
      (authService.verifyToken as jest.Mock).mockReturnValue({
        sub: '60d0fe4f5311236168a109ca',
        type: 'ACCESS',
      });
      // Use explicitly typed mock function and cast null to any
      mockGetUserById.mockResolvedValue(null as any);

      await authenticate(req as Request, res as any, next as any); // Use res/next as any

      expect(mockGetUserById).toHaveBeenCalledWith('60d0fe4f5311236168a109ca');
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      checkApiError(next.mock.calls[0][0], 401, 'User not found');
    });

    it('should attach user to request and call next if token is valid', async () => {
      const mockUser: Partial<IUser> = {
        _id: '60d0fe4f5311236168a109ca',
        name: 'Test User',
        role: 'user',
      };
      req.headers = { authorization: 'Bearer valid-token' };
      (authService.verifyToken as jest.Mock).mockReturnValue({
        sub: '60d0fe4f5311236168a109ca',
        type: 'ACCESS',
      });
      mockGetUserById.mockResolvedValue(mockUser as IUser);

      await authenticate(req as Request, res as any, next as any); // Use res/next as any

      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('authorize middleware', () => {
    it('should call next with error if user is not authenticated', () => {
      const authorizeMiddleware = authorize(['admin']);
      authorizeMiddleware(req as Request, res as any, next as any); // Use res/next as any
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      checkApiError(next.mock.calls[0][0], 401, 'Please authenticate');
    });

    it('should call next with error if user does not have required role', () => {
      const authorizeMiddleware = authorize(['admin']);
      req.user = { role: 'user' } as any;
      authorizeMiddleware(req as Request, res as any, next as any); // Use res/next as any
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      checkApiError(
        next.mock.calls[0][0],
        403,
        'Forbidden: Insufficient permissions'
      );
    });

    it('should call next if user has required role', () => {
      const authorizeMiddleware = authorize(['admin']);
      req.user = { role: 'admin' } as any;
      authorizeMiddleware(req as Request, res as any, next as any); // Use res/next as any
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next if empty role array is provided', () => {
      const authorizeMiddleware = authorize([]);
      req.user = { role: 'user' } as any;
      authorizeMiddleware(req as Request, res as any, next as any); // Use res/next as any
      expect(next).toHaveBeenCalledWith();
    });
  });
});
