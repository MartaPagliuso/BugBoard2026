import { type Request, type Response } from "express";
import { z } from 'zod';
import { authService } from "../container.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

/**
   * Metodo che setta i cookie di autenticazione
   * @param res 
   * @param accessToken 
   * @param refreshToken 
   */
  function setAuthCookie(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const base = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
    };

    res.cookie('access_token', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }

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
      const {accessToken, refreshToken, user} = await authService.login(parsed.data.email, parsed.data.password);

      setAuthCookie(res, accessToken, refreshToken);
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
    try {
      await authService.logout(req.user!.sub);
    } catch (error) {
      console.error(error);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return res.status(200).json({ message: 'Logout effettuato con successo.' });
  }

  /**
   * Metodo che permette il cambio della password
   * @param req 
   * @param res 
   * @returns 
   */
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
      if (error instanceof Error) {
        if (error.message === '[!] Credenziali non valide.')
          return res.status(401).json({ error: '[!] Errore: password attuale non corretta.' });

        if (error.message === '[!] Passoword identica')
          return res.status(400).json({ error: '[!] Errore: la nuova password deve essere diversa da quella attuale.' });
      }
        

      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il cambio password.' });
    }
  }

  static async refresh(req: Request, res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token)
      return res.status(401).json({ error: '[!] Errore: refresh token assente' });

    try {
      const { accessToken, refreshToken } = await authService.refresh(token);
      setAuthCookie(res, accessToken, refreshToken);
      return res.status(200).json({ message: 'Token rinnovato' });
    } catch {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token', { path: '/auth/refresh' });
      return res.status(401).json({ error: '[!] Errore: Refresh Token non valido.' });
    }
  }
}