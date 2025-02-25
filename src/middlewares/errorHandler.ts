import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import config from '../config/config';
import logger from '../config/logger';

const sendErrorDev = (err: ApiError, res: Response) => {
  res.status(err.statusCode).json({
    status: 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: ApiError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const errorConverter = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
    const message = error.message || String(error);
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;

  if (config.env === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

export { errorConverter, errorHandler };
