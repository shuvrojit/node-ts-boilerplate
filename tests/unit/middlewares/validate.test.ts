import { Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../../../src/middlewares/validate';
import ApiError from '../../../src/utils/ApiError';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should validate request body successfully', async () => {
    const schema = {
      body: z.object({
        name: z.string().min(3),
        age: z.number().positive(),
      }),
    };

    mockRequest.body = {
      name: 'John',
      age: 25,
    };

    await validate(schema)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
    expect(mockRequest.body).toEqual({
      name: 'John',
      age: 25,
    });
  });

  it('should validate request query successfully', async () => {
    const schema = {
      query: z.object({
        page: z.string().transform(Number),
        limit: z.string().transform(Number),
      }),
    };

    mockRequest.query = {
      page: '1',
      limit: '10',
    };

    await validate(schema)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
    expect(mockRequest.query).toEqual({
      page: 1,
      limit: 10,
    });
  });

  it('should validate request params successfully', async () => {
    const schema = {
      params: z.object({
        id: z.string().uuid(),
      }),
    };

    mockRequest.params = {
      id: '123e4567-e89b-12d3-a456-426614174000',
    };

    await validate(schema)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
    expect(mockRequest.params).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
  });

  it('should handle validation error for invalid body', async () => {
    const schema = {
      body: z.object({
        name: z.string().min(3),
        age: z.number().positive(),
      }),
    };

    mockRequest.body = {
      name: 'Jo',
      age: -1,
    };

    await validate(schema)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const error = nextFunction.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain('Validation failed');
  });

  it('should pass through when no schema is provided for a request part', async () => {
    const schema = {
      query: z.object({
        page: z.string(),
      }),
    };

    mockRequest = {
      query: { page: '1' },
      body: { someData: true },
    };

    await validate(schema)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
    expect(mockRequest.body).toEqual({ someData: true });
  });

  it('should handle non-Zod errors', async () => {
    const schema = {
      body: {
        parse: () => {
          throw new Error('Some other error');
        },
      } as unknown as z.ZodType,
    };

    mockRequest.body = {};

    await validate(schema)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
  });
});
