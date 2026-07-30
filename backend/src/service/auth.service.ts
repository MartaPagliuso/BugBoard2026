import { verifyPassword, hashPassword } from "../utils/password.js";
import { createToken } from "../utils/jwt.js";
import * as userRepository from '../repository/users.repository.js';
import { createRefreshToken, hashRefreshToken } from "../utils/refresh.js";

/**
 * Servizio che permette di effettuare il login. 
 * Prende le credenziali e genera il token
 * @param email 
 * @param password 
 * @returns 
 */
export async function login(email: string, password: string) {
  const user = await userRepository.findUserByEmail(email);
  if (!user)
    throw new Error('[!] Credenziali non valide');

  const passwordVerificata = await verifyPassword(user.password, password);
  if (!passwordVerificata)
    throw new Error('[!] Credenziali non valide');
  
  const refreshToken = createRefreshToken();
  await userRepository.setRefreshTokenHash(user.id, hashRefreshToken(refreshToken));

  return {
    accessToken: createToken({ sub: user.id, role: user.role }),
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
}

/**
 * Servizio che permette di fare il logout
 * Annulla il refresh_token azzerando la colonna
 * @param userId 
 */
export async function logout(userId: string) {
  await userRepository.setRefreshTokenHash(userId, null);
}

/**
 * Servizio che permette di aggiornare il refresh_token
 * Genera un token nuovo e cancella il vecchio
 * @param refreshToken 
 * @returns 
 */
export async function refresh(refreshToken: string) {
  const hash = hashRefreshToken(refreshToken);
  const user = await userRepository.findUserByRefreshToken(hash); // ricerco in base al refresh_token così da non fidarci di nessun dato proveniente dal client

  if (!user)
    throw new Error('[!] Refresh Token non valido');

  const newRefreshToken = createRefreshToken();
  await userRepository.setRefreshTokenHash(user.id, hashRefreshToken(newRefreshToken));

  return {
    accessToken: createToken({ sub: user.id, role: user.role }),
    refreshToken: newRefreshToken,
  };
}

/**
 * Servizio che permette di cambiare la password di un utente
 * @param userId 
 * @param currentPassword 
 * @param newPassword 
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await userRepository.findUserById(userId);
  if (!user)
    throw new Error('[!] Errore: utente non trovato.');

  const passwordVerificata = await verifyPassword(user.password, currentPassword);

  if (!passwordVerificata)
    throw new Error('[!] Credenziali non valide.');

  await userRepository.updatePassword(userId, await hashPassword(newPassword));
}