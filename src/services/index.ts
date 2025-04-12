import userService from './user.service';
import authService from './auth.service';
import {
  CreateUserInput,
  UpdateUserInput,
  QueryUserInput,
} from './user.service';
import { LoginCredentials, AuthTokens, TokenPayload } from './auth.service';

export {
  userService,
  authService,
  CreateUserInput,
  UpdateUserInput,
  QueryUserInput,
  LoginCredentials,
  AuthTokens,
  TokenPayload,
};

// Export for easier imports
export default {
  userService,
  authService,
};
