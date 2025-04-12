import express, { Router } from 'express';
import { authController } from '../../controllers';
import { validate } from '../../middlewares/validate';
import { authValidation } from '../../validations';
import { authenticate } from '../../middlewares/auth';

const router: Router = express.Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validate(authValidation.registerSchema),
  authController.register
);

/**
 * @route POST /auth/login
 * @desc Log in a user
 * @access Public
 */
router.post(
  '/login',
  validate(authValidation.loginSchema),
  authController.login
);

/**
 * @route POST /auth/logout
 * @desc Log out a user
 * @access Public
 */
router.post('/logout', authController.logout);

/**
 * @route POST /auth/refresh
 * @desc Refresh auth tokens
 * @access Public (with refresh token in cookie)
 */
router.post(
  '/refresh',
  validate(authValidation.refreshTokensSchema),
  authController.refreshTokens
);

/**
 * @route GET /auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;
