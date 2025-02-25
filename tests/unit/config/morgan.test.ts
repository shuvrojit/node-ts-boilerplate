import morgan, { Options } from 'morgan';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';
import logger from '../../../src/config/logger';

// Mock morgan
jest.mock('morgan', () => {
  return jest.fn().mockReturnValue((_req: any, _res: any, next: any) => next());
});

// Mock logger
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('Morgan Middleware Configuration', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });

  it('should use "dev" format in development environment', () => {
    process.env.NODE_ENV = 'development';
    // Re-import to trigger format selection with new NODE_ENV
    jest.isolateModules(() => {
      require('../../../src/config/morgan');
      expect(morgan as unknown as jest.Mock).toHaveBeenCalledWith(
        'dev',
        expect.any(Object)
      );
    });
  });

  it('should use "combined" format in production environment', () => {
    process.env.NODE_ENV = 'production';
    jest.isolateModules(() => {
      require('../../../src/config/morgan');
      expect(morgan as unknown as jest.Mock).toHaveBeenCalledWith(
        'combined',
        expect.any(Object)
      );
    });
  });

  it('should skip logging in test environment', () => {
    process.env.NODE_ENV = 'test';
    jest.isolateModules(() => {
      require('../../../src/config/morgan');
      const options = (morgan as unknown as jest.Mock).mock
        .calls[0][1] as Options<Request, Response>;
      expect(options.skip?.(null as any, null as any)).toBe(true);
    });
  });

  it('should not skip logging in development environment', () => {
    process.env.NODE_ENV = 'development';
    jest.isolateModules(() => {
      require('../../../src/config/morgan');
      const options = (morgan as unknown as jest.Mock).mock
        .calls[0][1] as Options<Request, Response>;
      expect(options.skip?.(null as any, null as any)).toBe(false);
    });
  });

  it('should pipe logs to winston logger', () => {
    jest.isolateModules(() => {
      require('../../../src/config/morgan');
      const options = (morgan as unknown as jest.Mock).mock
        .calls[0][1] as Options<Request, Response>;

      expect(options.stream).toBeDefined();

      const testMessage = 'Test log message';
      options.stream!.write(testMessage + '\n');

      expect(logger.info).toHaveBeenCalledWith(testMessage);
    });
  });
});
