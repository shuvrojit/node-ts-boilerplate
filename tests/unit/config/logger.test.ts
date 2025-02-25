import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { jest } from '@jest/globals';

// Mock winston and winston-daily-rotate-file
jest.mock('winston', () => {
  const actual = jest.requireActual<typeof winston>('winston');
  return {
    addColors: actual.addColors,
    createLogger: jest.fn().mockReturnValue({
      add: jest.fn(),
    }),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      json: jest.fn(),
      simple: jest.fn(),
      colorize: jest.fn(),
      printf: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
  };
});

jest.mock('winston-daily-rotate-file');

describe('Logger Configuration', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should use json format in production', () => {
    process.env.NODE_ENV = 'production';
    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(winston.format.json).toHaveBeenCalled();
      expect(winston.format.simple).not.toHaveBeenCalled();
    });
  });

  it('should use simple format in development', () => {
    process.env.NODE_ENV = 'development';
    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(winston.format.simple).toHaveBeenCalled();
      expect(winston.format.json).not.toHaveBeenCalled();
    });
  });

  it('should set log level to info in production', () => {
    process.env.NODE_ENV = 'production';
    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      );
    });
  });

  it('should set log level to debug in development', () => {
    process.env.NODE_ENV = 'development';
    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        })
      );
    });
  });

  it('should configure daily rotate file transport', () => {
    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(DailyRotateFile).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'logs/api-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        })
      );
    });
  });

  it('should configure error log file transport', () => {
    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(winston.transports.File).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'logs/errors.log',
          level: 'error',
        })
      );
    });
  });

  it('should add console transport in development', () => {
    process.env.NODE_ENV = 'development';
    const mockLogger = { add: jest.fn() };
    (winston.createLogger as jest.Mock).mockReturnValue(mockLogger);

    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(mockLogger.add).toHaveBeenCalledWith(
        expect.any(winston.transports.Console)
      );
    });
  });

  it('should not add console transport in production', () => {
    process.env.NODE_ENV = 'production';
    const mockLogger = { add: jest.fn() };
    (winston.createLogger as jest.Mock).mockReturnValue(mockLogger);

    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(mockLogger.add).not.toHaveBeenCalled();
    });
  });

  it('should configure exception handlers', () => {
    jest.isolateModules(() => {
      require('../../../src/config/logger');
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          exceptionHandlers: expect.arrayContaining([
            expect.any(winston.transports.File),
          ]),
        })
      );
    });
  });
});
