import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../src/middlewares/asyncHandler';

describe('asyncHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  test('should handle async function success', async () => {
    const mockData = { message: 'success' };
    const handler = asyncHandler(async (_req, res: Response) => {
      res.json(mockData);
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(mockData);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should handle async function error', async () => {
    const error = new Error('Async error');
    const handler = asyncHandler(async () => {
      throw error;
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
