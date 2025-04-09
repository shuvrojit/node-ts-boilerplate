import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './config/logger';
import { connectDB } from './config/db';

connectDB();

const PORT: number = Number(process.env.PORT) || 8000;

if (isNaN(PORT)) {
  throw new Error('Invalid PORT environment variable');
}

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} ...`);
});
