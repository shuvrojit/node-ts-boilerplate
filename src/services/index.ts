import userService from './user.service';
import {
  CreateUserInput,
  UpdateUserInput,
  QueryUserInput,
} from './user.service';

export { userService, CreateUserInput, UpdateUserInput, QueryUserInput };

// Export for easier imports
export default {
  userService,
};
