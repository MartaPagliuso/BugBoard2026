import { hashPassword } from "../utils/password.js";
import * as userRepository from '../repository/users.repository.js';

export async function ensureDefaultAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('[!] Email e Password dell\'admin di default non presenti.');
  }

  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    console.log('Admin di default già presente. Nessuna operazione effettuata.');
    return;
  }

  await userRepository.insertUser({
    email,
    password: await hashPassword(password),
    role: 'admin'
  });

  console.log('Account admin di default creato con successo.');
}