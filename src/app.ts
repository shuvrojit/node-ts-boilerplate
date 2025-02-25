import express, { Express, Response, Request, NextFunction } from 'express';
import { errorConverter, errorHandler } from './middlewares/errorHandler';
import morganMiddleware from './config/morgan';

const app: Express = express();

app.use(express.json());

app.use(morganMiddleware);

app.get('/', (_, res: Response) => {
  res.status(200);
  res.send('root');
});

// Global error handling middleware
app.use(errorConverter);
app.use(errorHandler);

export default app;
