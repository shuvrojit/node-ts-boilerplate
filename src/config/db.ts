import mongoose from 'mongoose';
import config from './config';
import logger from './logger';

// Define the mongoose config type for better type safety
interface MongooseConfig {
  url: string;
  options: mongoose.ConnectOptions;
}

// Add mongoose property to config type
type ConfigWithMongoose = typeof config & {
  mongoose?: MongooseConfig;
};

/**
 * Connect to MongoDB
 */
export const connectDB = async (): Promise<void> => {
  // First check if MongoDB URL is defined
  const typedConfig = config as ConfigWithMongoose;
  const url = typedConfig.mongoose?.url || process.env.MONGODB_URL;

  if (!url) {
    throw new Error('MONGODB_URL is not defined in environment variables');
  }

  try {
    const options =
      typedConfig.mongoose?.options ||
      ({
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions);

    await mongoose.connect(url, options);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};
