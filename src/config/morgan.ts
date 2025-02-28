import morgan, { StreamOptions } from 'morgan';
import logger from './logger';

// Define a stream to use with Morgan that pipes logs to Winston
const stream: StreamOptions = {
  write: (message: string): void => {
    logger.info(message.trim());
    return;
  },
};

// Skip logging if the environment is 'test'
const skip = (): boolean => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

const morganMiddleware = morgan(morganFormat, { stream, skip });

export default morganMiddleware;
