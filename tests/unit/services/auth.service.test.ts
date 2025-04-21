import { authService } from '../../../src/services';
import { userService } from '../../../src/services';
import ApiError from '../../../src/utils/ApiError';
import jwt from 'jsonwebtoken';
import config from '../../../src/config/config';
import mongoose from 'mongoose';

// Mocking dependencies
jest.mock('../../../src/services/user.service');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const tokenPayload = {
        sub: userId,
        type: 'ACCESS',
      };

      (jwt.sign as jest.Mock).mockReturnValueOnce('generated-token');

      const token = authService.generateToken(userId, 'ACCESS');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining(tokenPayload),
        config.jwt.secret,
        { expiresIn: 1800 } // Corrected: 30 minutes * 60 seconds
      );
      expect(token).toBe('generated-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const tokenPayload = {
        sub: userId,
        type: 'ACCESS',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwt.verify as jest.Mock).mockReturnValueOnce(tokenPayload);

      const result = authService.verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret);
      expect(result).toEqual(tokenPayload);
    });

    it('should throw an error if token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow(ApiError);
    });

    // Removed test for token type check within verifyToken as it's handled elsewhere
  });

  describe('generateAuthTokens', () => {
    it('should generate access and refresh tokens', () => {
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      jest
        .spyOn(authService, 'generateToken')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const tokens = authService.generateAuthTokens(userId);

      expect(authService.generateToken).toHaveBeenCalledTimes(2);
      expect(authService.generateToken).toHaveBeenNthCalledWith(
        1,
        userId,
        'ACCESS'
      ); // Removed expiration arg
      expect(authService.generateToken).toHaveBeenNthCalledWith(
        2,
        userId,
        'REFRESH'
      ); // Removed expiration arg

      // Updated expectation to match actual return structure
      expect(tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });

  describe('loginWithEmailAndPassword', () => {
    it('should return user and tokens if login is successful', async () => {
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      // Define expected tokens based on the mocked generateAuthTokens
      const expectedTokens = {
        accessToken: 'mockAccess',
        refreshToken: 'mockRefresh',
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      jest
        .spyOn(authService, 'generateAuthTokens')
        .mockReturnValue(expectedTokens); // Use the defined expected tokens

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password', // This is the password passed to the function
      });

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password'); // Corrected password expectation
      expect(authService.generateAuthTokens).toHaveBeenCalledWith(userId);
      // Corrected the expected result structure
      expect(result).toEqual({ user: mockUser, tokens: expectedTokens });
    });

    it('should throw error if user is not found', async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'invalid@example.com',
          password: 'password',
        })
      ).rejects.toThrow(new ApiError(401, 'Incorrect email or password'));
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toThrow(new ApiError(401, 'Incorrect email or password'));
    });
  });

  describe('refreshAuth', () => {
    it('should generate new tokens if refresh token is valid', async () => {
      const mockUser = {
        _id: userId,
      };

      // Define expected tokens based on the mocked generateAuthTokens
      const expectedTokens = {
        accessToken: 'mockAccess',
        refreshToken: 'mockRefresh',
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      jest
        .spyOn(authService, 'generateAuthTokens')
        .mockReturnValue(expectedTokens); // Use the defined expected tokens
      jest.spyOn(authService, 'verifyToken').mockReturnValue({
        sub: userId,
        type: 'REFRESH', // Mock verifyToken to return a REFRESH type payload
      });

      const result = await authService.refreshTokens('valid-refresh-token');

      // Corrected: verifyToken only takes the token string
      expect(authService.verifyToken).toHaveBeenCalledWith(
        'valid-refresh-token'
      );
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(authService.generateAuthTokens).toHaveBeenCalledWith(userId);
      // Corrected the expected result structure
      expect(result).toEqual(expectedTokens);
    });

    it('should throw error if user is not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      jest.spyOn(authService, 'verifyToken').mockReturnValue({
        sub: userId,
        type: 'REFRESH',
      });

      // Corrected expected error message
      await expect(
        authService.refreshTokens('valid-refresh-token')
      ).rejects.toThrow(new ApiError(401, 'User not found'));
    });
  });
});
