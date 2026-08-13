import { UserRepository } from "./repository/users.repository.js";
import { UserService } from "./service/user.service.js";

import { AuthService } from "./service/auth.service.js";

export const userRepository = new UserRepository();
export const userService = new UserService(userRepository);

export const authService = new AuthService(userRepository);