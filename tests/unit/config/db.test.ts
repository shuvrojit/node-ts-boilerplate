import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import connectDB from '../../../src/config/db';

// Mock mongoose with proper types
jest.mock('mongoose', () => {
  const mockMongoose = {
    connect: jest.fn().mockImplementation(async () => mockMongoose),
  };
  return mockMongoose;
});

// Type assertion for mocked connect function
const mockedConnect = mongoose.connect as jest.MockedFunction<
  typeof mongoose.connect
>;

describe('Database Connection', () => {
  const originalEnv = process.env;
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => {
    throw new Error('process.exit: ' + number);
  });
  const mockWrite = jest.spyOn(process.stdout, 'write');

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.MONGODB_URL = 'mongodb://test:27017';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(() => {
    mockExit.mockRestore();
    mockWrite.mockRestore();
  });

  it('should connect to database successfully', async () => {
    mockedConnect.mockResolvedValueOnce(mongoose);

    await connectDB();

    expect(mockedConnect).toHaveBeenCalledWith('mongodb://test:27017', {
      dbName: 'simple-auth',
    });
    expect(mockWrite).toHaveBeenCalledWith('Database connected\n');
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should handle connection error and exit process', async () => {
    const error = new Error('Connection failed');
    mockedConnect.mockRejectedValueOnce(error);

    await expect(connectDB()).rejects.toThrow('process.exit: 1');

    expect(mockedConnect).toHaveBeenCalledWith('mongodb://test:27017', {
      dbName: 'simple-auth',
    });
    expect(mockWrite).toHaveBeenCalledWith(`Error ${error}\n`);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should throw error when MONGODB_URL is not defined', async () => {
    delete process.env.MONGODB_URL;

    await expect(connectDB()).rejects.toThrow();
  });
});
