import { verifyPassword, hashPassword } from "../utils/password.js";
import { createToken } from "../utils/jwt.js";
import * as userRepository from '../repository/users.repository.js';

/**
 * Servizio che permette di effettuare il login. 
 * Prende le credenziali e genera il token
 * @param email 
 * @param password 
 * @returns 
 */
export async function login(email: string, password: string) {
  const user = await userRepository.findUserByEmail(email);
  const passwordVerificata = await verifyPassword(user.password, password);
  
  if (!passwordVerificata || !user)
    throw new Error('[!] Errore: password non valida.');

  const token = createToken({ sub: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
}


export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await userRepository.findUserById(userId);
  if (!user)
    throw new Error('[!] Errore: utente non trovato.');

  const passwordVerificata = await verifyPassword(user.password, currentPassword);

  if (!passwordVerificata)
    throw new Error('[!] Credenziali non valide.');

  await userRepository.updatePassword(userId, await hashPassword(newPassword));
}