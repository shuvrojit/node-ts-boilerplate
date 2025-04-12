import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import authService from '../../../src/services/auth.service';
import { userService } from '../../../src/services';
import ApiError from '../../../src/utils/ApiError';
import config from '../../../src/config/config';

// Mock dependencies
jest.mock('../../../src/services/user.service');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate an access token with correct payload and expiry', () => {
      const userId = '60d0fe4f5311236168a109ca';
      const tokenType = 'ACCESS';
      const mockToken = 'mock-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = authService.generateToken(userId, tokenType);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: userId, type: tokenType },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpirationMinutes * 60 }
      );
    });

    it('should generate a refresh token with correct payload and expiry', () => {
      const userId = '60d0fe4f5311236168a109ca';
      const tokenType = 'REFRESH';
      const mockToken = 'mock-refresh-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = authService.generateToken(userId, tokenType);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: userId, type: tokenType },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpirationDays * 24 * 60 * 60 }
      );
    });
  });

  describe('verifyToken', () => {
    it('should return payload if token is valid', () => {
      const mockPayload = { sub: '60d0fe4f5311236168a109ca', type: 'ACCESS' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const payload = authService.verifyToken('valid-token');

      expect(payload).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret);
    });

    it('should throw error if token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken('invalid-token')).toThrow(ApiError);
      expect(() => authService.verifyToken('invalid-token')).toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('login', () => {
    it('should return user and tokens if credentials are valid', async () => {
      const mockUser = {
        _id: '60d0fe4f5311236168a109ca',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateAuthTokens as jest.SpyInstance) = jest
        .spyOn(authService, 'generateAuthTokens')
        .mockReturnValue(mockTokens);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: mockUser,
        tokens: mockTokens,
      });
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(authService.generateAuthTokens).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
    });

    it('should throw error if email is incorrect', async () => {
      (userService.getUserByEmail as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Incorrect email or password');
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Incorrect email or password');
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const userId = '60d0fe4f5311236168a109ca';
      const mockPayload = { sub: userId, type: 'REFRESH' };
      const mockUser = { _id: userId };
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateAuthTokens as jest.SpyInstance) = jest
        .spyOn(authService, 'generateAuthTokens')
        .mockReturnValue(mockTokens);

      const result = await authService.refreshTokens('valid-refresh-token');

      expect(result).toEqual(mockTokens);
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-refresh-token',
        config.jwt.secret
      );
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(authService.generateAuthTokens).toHaveBeenCalledWith(userId);
    });

    it('should throw error if token is not a refresh token', async () => {
      const mockPayload = { sub: '60d0fe4f5311236168a109ca', type: 'ACCESS' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      await expect(authService.refreshTokens('access-token')).rejects.toThrow(
        'Invalid token type'
      );
    });

    it('should throw error if user does not exist', async () => {
      const mockPayload = { sub: '60d0fe4f5311236168a109ca', type: 'REFRESH' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshTokens('valid-refresh-token')
      ).rejects.toThrow('User not found');
    });
  });
});
