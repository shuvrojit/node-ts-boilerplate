import jwt from 'jsonwebtoken';
import config from '../config/config';
import { IUser } from '../models';
import ApiError from '../utils/ApiError';
import { userService } from './index';

export interface TokenPayload {
  sub: string; // User ID
  type: 'ACCESS' | 'REFRESH';
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Generate token for a user
   * @param {string} userId - User ID
   * @param {TokenPayload['type']} type - Token type (access or refresh)
   * @returns {string} JWT token
   */
  public generateToken(userId: string, type: TokenPayload['type']): string {
    const payload: TokenPayload = {
      sub: userId,
      type,
    };

    let expiresIn: string | number;
    if (type === 'ACCESS') {
      expiresIn = config.jwt.accessExpirationMinutes * 60; // Convert to seconds
    } else {
      expiresIn = config.jwt.refreshExpirationDays * 24 * 60 * 60; // Convert to seconds
    }

    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token
   * @returns {TokenPayload} Decoded token payload
   */
  public verifyToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return payload;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired token');
    }
  }

  /**
   * Generate auth tokens for a user
   * @param {string} userId - User ID
   * @returns {AuthTokens} Access and refresh tokens
   */
  public generateAuthTokens(userId: string): AuthTokens {
    const accessToken = this.generateToken(userId, 'ACCESS');
    const refreshToken = this.generateToken(userId, 'REFRESH');
    return { accessToken, refreshToken };
  }

  /**
   * Login with email and password
   * @param {LoginCredentials} credentials - Login credentials
   * @returns {Promise<{user: IUser, tokens: AuthTokens}>} User and tokens
   */
  public async login(
    credentials: LoginCredentials
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    try {
      // Get user by email
      const user = await userService.getUserByEmail(credentials.email);

      // Verify password
      const isPasswordMatch = await user.comparePassword(credentials.password);
      if (!isPasswordMatch) {
        throw new ApiError(401, 'Incorrect email or password');
      }

      // Ensure user has a valid ID
      if (!user._id) {
        throw new ApiError(500, 'Invalid user data');
      }

      // Generate tokens using a safe string conversion
      const tokens = this.generateAuthTokens(String(user._id));
      return { user, tokens };
    } catch (error) {
      // Ensure consistent error message for failed login attempts
      // regardless of whether the user was not found or the password didn't match
      throw new ApiError(401, 'Incorrect email or password');
    }
  }

  /**
   * Refresh auth tokens
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<AuthTokens>} New access and refresh tokens
   */
  public async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.verifyToken(refreshToken);
      if (payload.type !== 'REFRESH') {
        throw new ApiError(401, 'Invalid token type');
      }

      // Check if user exists
      const userId = payload.sub;
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      // Generate new tokens
      return this.generateAuthTokens(userId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, 'Invalid refresh token');
    }
  }
}

export default new AuthService();
