import express, { Router } from 'express';
import { userController } from '../../controllers';
import { validate } from '../../middlewares/validate';
import { userValidation } from '../../validations';

const router: Router = express.Router();

router
  .route('/')
  .post(validate(userValidation.createUserSchema), userController.createUser)
  .get(validate(userValidation.queryUsersSchema), userController.getUsers);

router
  .route('/:userId')
  .get(validate(userValidation.getUserSchema), userController.getUser)
  .patch(validate(userValidation.updateUserSchema), userController.updateUser)
  .delete(validate(userValidation.deleteUserSchema), userController.deleteUser);

export default router;
