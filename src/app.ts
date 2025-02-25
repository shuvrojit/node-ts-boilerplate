import express, { Express, Response } from 'express';
import {
  errorConverter,
  errorHandler,
  notFound,
} from './middlewares/errorHandler';
import morganMiddleware from './config/morgan';

const app: Express = express();

app.use(express.json());

app.use(morganMiddleware);

app.get('/', (_, res: Response) => {
  res.status(200);
  res.send('root');
});

// Add the routes for error testing
app.get('/error', () => {
  throw new Error('Test error');
});

app.get('/api-error', () => {
  const ApiError = require('./utils/ApiError').default;
  throw new ApiError(400, 'Bad request error');
});

// Add 404 handler for routes that don't exist
app.use(notFound);

// Global error handling middleware
app.use(errorConverter);
app.use(errorHandler);

export default app;
