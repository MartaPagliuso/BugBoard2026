import crypto from 'node:crypto';

// uso sha256 invece di argon2 perché il token è già una stringa casuale da 48 byte.
// argon2 ci metterebbe 80ms inutili

/**
 * Metodo che crea il refreshToken
 */
export const createRefreshToken = () => {
  crypto.randomBytes(48).toString('base64url');
}

/**
 * Metodo che hasha il refresh token per non salvarlo in chiaro
 * @param token 
 */
export const hashRefreshToken = (token: string) => {
  crypto.createHash('sha256').update(token).digest('hex');
}