import express, { Router } from 'express';
import userRoute from './user.route';
import authRoute from './auth.route';

const router: Router = express.Router();

// Define route structure
interface Route {
  path: string;
  route: Router;
}

// Add routes
const routes: Route[] = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
];

// Register all API routes
routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
