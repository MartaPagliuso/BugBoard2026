import { type Request, type Response } from "express";
import { z } from 'zod';
import * as authService from '../service/auth.service.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export class AuthController {
  /**
   * Metodo per effettuare il login di un utente
   * @param req 
   * @param res 
   * @returns 
   */
  static async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success)
      return res.status(400).json({ error: '[!] Credenziali non valide.'});

    try {
      const {token, user} = await authService.login(parsed.data.email, parsed.data.password);

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      return res.status(200).json({ user });
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Errore: password non valida.') {
        return res.status(401).json({ error: '[!] Errore: credenziali non valide.' });
      }

      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il login' });
    }
  }

  /**
   * Metodo per effettuare il logout da parte di un utente
   * @param req 
   * @param res 
   * @returns 
   */
  static async logout(req: Request, res: Response) {
    res.clearCookie('access_token');
    return res.status(200).json({ message: 'Logout effettuato con successo.' });
  }

  static async changePassword(req: Request, res: Response) {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: '[!] Errore: dati non validi.' });

    try {
      await authService.changePassword(
        req.user!.sub,
        parsed.data.currentPassword,
        parsed.data.newPassword,
      );

      res.clearCookie('access_token');

      return res.status(200).json({ message: 'Password aggiornata. Effettua nuovamente il login.' });
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Credenziali non valide.')
        return res.status(401).json({ error: '[!] Password attuale non corretta.' });

      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il cambio password.' });
    }
  }
}