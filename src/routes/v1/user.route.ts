import express, { Router } from 'express';
import { userController } from '../../controllers';
import { validate } from '../../middlewares/validate';
import { userValidation } from '../../validations';
import { authenticate, authorize } from '../../middlewares/auth';

const router: Router = express.Router();

// All user routes require authentication
router.use(authenticate);

router
  .route('/')
  .post(
    authorize(['admin']), // Only admins can create users
    validate(userValidation.createUserSchema),
    userController.createUser
  )
  .get(
    authorize(['admin']), // Only admins can list all users
    validate(userValidation.queryUsersSchema),
    userController.getUsers
  );

router
  .route('/:userId')
  .get(
    // Users can get their own info, admins can get any user
    validate(userValidation.getUserSchema),
    userController.getUser
  )
  .patch(
    // Users can update their own info, admins can update any user
    validate(userValidation.updateUserSchema),
    userController.updateUser
  )
  .delete(
    authorize(['admin']), // Only admins can delete users
    validate(userValidation.deleteUserSchema),
    userController.deleteUser
  );

export default router;
