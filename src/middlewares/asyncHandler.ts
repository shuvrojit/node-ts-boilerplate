import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async controllers to catch errors and pass them to the error handler middleware
 */
const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
