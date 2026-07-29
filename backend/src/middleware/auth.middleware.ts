import { type Request, type Response, type NextFunction } from "express";
import { TokenPayload, verifyToken } from "../utils/jwt.js";

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