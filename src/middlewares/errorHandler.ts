import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import config from '../config/config';
import logger from '../config/logger';

/**
 * Convert regular Error to ApiError
 */
export const errorConverter = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error instanceof Error ? (error as any).statusCode || 400 : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, true); // Set isOperational to true
  }

  next(error);
};

/**
 * Handle and format error response
 */
export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { statusCode, message, isOperational, stack } = err;

  if (config.env === 'development') {
    // Send detailed error in development
    res.status(statusCode).json({
      status: 'error',
      message,
      error: err,
      stack,
    });
  } else {
    // Send appropriate error in production
    if (isOperational) {
      // Operational errors can be sent directly
      res.status(statusCode).json({
        status: 'error',
        message,
      });
    } else {
      // Programming or other unknown errors: don't leak error details
      logger.error('ERROR 💥', err);
      res.status(statusCode).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};

/**
 * 404 Not Found handler
 */
export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new ApiError(404, `Not found: ${req.originalUrl}`));
};
