import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { authService, userService } from '../services';
import { IUser } from '../models';

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Authentication middleware to verify JWT token
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the auth header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Authentication token not provided');
    }

    // Verify the token
    const payload = authService.verifyToken(token);
    if (payload.type !== 'ACCESS') {
      throw new ApiError(401, 'Invalid token type');
    }

    // Get user
    const user = await userService.getUserById(payload.sub);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware to check user role
 * @param {string[]} requiredRoles - Required roles
 */
export const authorize = (requiredRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Check if user exists in request
      if (!req.user) {
        throw new ApiError(401, 'Please authenticate');
      }

      // Check if user has required role
      if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
        throw new ApiError(403, 'Forbidden: Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
