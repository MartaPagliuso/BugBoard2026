import { hashPassword } from "../utils/password.js";
import * as userRepository from "../repository/users.repository.js";

export type CreateUserInput = {
  email: string;
  password: string;
  role?: 'user' | 'admin';
};

export async function createUser(input: CreateUserInput) {
  const passwordHashed = await hashPassword(input.password);

  return userRepository.insertUser({
    email: input.email,
    password: passwordHashed,
    role: input.role ?? 'user',
  });
}