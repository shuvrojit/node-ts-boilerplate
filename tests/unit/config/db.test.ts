import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import connectDB from '../../../src/config/db';

// Simpler approach: mock specific methods only
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

// Get the mocked connect function
const mockedConnect = mongoose.connect as jest.MockedFunction<
  typeof mongoose.connect
>;

describe('Database Connection', () => {
  const mongoUrl = 'mongodb://172.27.0.2:27017/semantiai';

  const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => {
    throw new Error('process.exit: ' + number);
  });

  const mockWrite = jest.spyOn(process.stdout, 'write');

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure MONGODB_URL is set, using the value from .env
    process.env.MONGODB_URL = mongoUrl;
  });

  afterEach(() => {});

  afterAll(() => {
    mockExit.mockRestore();
    mockWrite.mockRestore();
  });

  it('should connect to database successfully', async () => {
    mockedConnect.mockResolvedValueOnce(mongoose);
    await connectDB();
    expect(mockedConnect).toHaveBeenCalledWith(mongoUrl, {
      dbName: 'simple-auth',
    });
    expect(mockWrite).toHaveBeenCalledWith('Database connected\n');
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should handle connection error and exit process', async () => {
    const error = new Error('Connection failed');
    mockedConnect.mockRejectedValueOnce(error);
    await expect(connectDB()).rejects.toThrow('process.exit: 1');
    expect(mockedConnect).toHaveBeenCalledWith(mongoUrl, {
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
