import mongoose from 'mongoose';
// Mock the config module before importing other modules
jest.mock('../../../src/config/config', () => ({
  default: {
    env: 'test',
    mongoose: {
      url: 'mongodb://localhost:27017/test-db',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  },
}));

import { connectDB, disconnectDB } from '../../../src/config/db';
import config from '../../../src/config/config';

// Mock mongoose to prevent actual database connections
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  connection: {
    readyState: 1,
  },
}));

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to MongoDB successfully', async () => {
    // Setup
    const oldUrl = process.env.MONGODB_URL;
    process.env.MONGODB_URL = 'mongodb://test:27017/testdb';

    // Execute
    await connectDB();

    // Verify
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected

    // Cleanup
    process.env.MONGODB_URL = oldUrl;
  });

  it('should throw error when MONGODB_URL is not defined', async () => {
    // Setup
    const oldUrl = process.env.MONGODB_URL;
    delete process.env.MONGODB_URL;

    // Temporarily modify the config object for this test using type assertion
    const configAny = config as any;
    const originalMongoose = configAny.mongoose;
    configAny.mongoose = undefined;

    // Execute and Verify
    await expect(connectDB()).rejects.toThrow();

    // Cleanup
    process.env.MONGODB_URL = oldUrl;
    configAny.mongoose = originalMongoose;
  });

  it('should disconnect from MongoDB', async () => {
    await disconnectDB();
    expect(mongoose.disconnect).toHaveBeenCalledTimes(1);
  });
});
