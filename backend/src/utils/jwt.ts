import jwt from 'jsonwebtoken';

export type TokenPayload = {
  sub: string; // subject = id dell'utente
  role: 'user' | 'admin';
};

const secret = process.env.JWT_SECRET;
if (!secret)
  throw new Error('[!] JWT_SECRET non presente nel file .env');

/**
 * Metodo per la creazione di un nuovo token
 * @param payload 
 * @returns 
 */
export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret!, {
    expiresIn: '15m',
    algorithm: 'HS256',
  });
}

/**
 * Metodo per la verifica del token
 * @param token 
 * @returns 
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret!, {
    algorithms: ['HS256'],
  }) as TokenPayload;
}