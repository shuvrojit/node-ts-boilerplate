import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ApiError from '../utils/ApiError';

export type ValidationSchema = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

/**
 * Middleware factory for request validation using Zod schemas
 * @param schema Validation schema for request parts
 */
export const validate = (schema: ValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        const errorMessage = validationErrors
          .map((e) => `${e.path} - ${e.message}`)
          .join(', ');
        next(new ApiError(400, `Validation failed: ${errorMessage}`, false));
      } else {
        next(error);
      }
    }
  };
};
