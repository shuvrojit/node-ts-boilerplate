import { Request, Response, NextFunction } from 'express';
import { authService, userService } from '../services';
import asyncHandler from '../middlewares/asyncHandler';
import config from '../config/config';
import { IUser } from '../models';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: 'strict' as const,
  maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000, // days to milliseconds
};

/**
 * Register a new user
 */
const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Create user in the database
    const user: IUser = await userService.createUser(req.body);

    // Generate auth tokens
    const tokens = authService.generateAuthTokens(String(user._id));

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

    // Return the user data and access token
    res.status(201).json({
      status: 'success',
      data: {
        user,
        accessToken: tokens.accessToken,
      },
    });
  }
);

/**
 * Login with email and password
 */
const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Get credentials from request body
    const { email, password } = req.body;

    // Authenticate user
    const { user, tokens } = await authService.login({ email, password });

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

    // Return user data and access token
    res.status(200).json({
      status: 'success',
      data: {
        user,
        accessToken: tokens.accessToken,
      },
    });
  }
);

/**
 * Logout the user
 */
const logout = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
);

/**
 * Refresh tokens
 */
const refreshTokens = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Get refresh token from cookies
    const { refreshToken } = req.cookies;

    // Generate new auth tokens
    const tokens = await authService.refreshTokens(refreshToken);

    // Set the new refresh token in a cookie
    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

    // Return new access token
    res.status(200).json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken,
      },
    });
  }
);

/**
 * Get current user profile
 */
const getProfile = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Return authenticated user (added by auth middleware)
    res.status(200).json({
      status: 'success',
      data: req.user,
    });
  }
);

export default {
  register,
  login,
  logout,
  refreshTokens,
  getProfile,
};
