import { type Request, type Response, type NextFunction } from "express";
import { TokenPayload, verifyToken } from "../utils/jwt.js";
import { userRepository } from "../container.js";
import { type UserRole } from '../db/schema/users.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware che controlla se l'utente è autenticato
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (!token)
    return res.status(401).json({ error: '[!] Autenticazione richiesta.' });

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: '[!] Token non valido o scaduto' });
  }
}

/**
 * Middleware che controlla il ruolo dell'utente autenticato
 * @param roles 
 * @returns 
 */
export function requireRole(...roles: UserRole[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user)
      return res.status(401).json({ error: '[!] Autenticazione richiesta.' });

    if (!roles.includes(req.user.role)) 
      return res.status(403).json({ error: '[!] Permessi insufficienti.' });

    return next();
  }
}

/**
 * Middleware che blocca l'utente se non ha cambiato la password
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export async function blockIfMustChangePassword(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next();

  const user = await userRepository.findById(req.user.sub);

  if (user?.mustChangePassword) {
    return res.status(403).json({
      error: '[!] Devi cambiare la password prima di continuare.',
      mustChangePassword: true,
    });
  }

  return next();
}

export function denyViewers(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'viewer')
    return res.status(403).json({ error: '[!] Errore: account in sola lettura' });

  return next();
}