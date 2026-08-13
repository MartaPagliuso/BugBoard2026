import { type Request, type Response } from "express";
import {email, z} from 'zod';
import { userService } from "../container.js";

// serve per valida l'input
const createUserSchema = z.object({
  nome: z.string().min(1).max(50),
  cognome: z.string().min(1).max(50),
  password: z.string().min(8),
  role: z.enum(['viewer', 'user', 'admin']).optional(),
});

export class UserController {
  /**
   * Metodo per la creazione di un nuovo utente
   * @param req 
   * @param res 
   */
  static async create(req: Request, res: Response) {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success)
      return res.status(400).json({ error: '[!] Dati non validi', details: parsed.error.flatten() });

    try {
      const user = await userService.createUser(parsed.data);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Nome non valido.')
        return res.status(400).json({ error: '[!] Errore: nome e cognome devono contenere lettere valide.' });

      console.error(error);
      res.status(500).json({ error: '[!] Errore durante la creazione di un nuovo utente.' });
    }
  }

  /**
   * Metodo che restituisce l'elenco di tutti gli utenti nel sistema
   * @param req 
   * @param res 
   * @returns 
   */
  static async list (req: Request, res: Response) {
    try {
      const users = await userService.listUsers();
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il recupero degli utenti' });
    }
  }

  /**
   * Metodo che restituisce le informazioni dell'utente autenticato
   * @param req 
   * @param res 
   * @returns 
   */
  static async me(req: Request, res: Response) {
    try {
      const profile = await userService.getProfile(req.user!.sub);
      return res.status(200).json(profile);
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Utente non trovato')
        return res.status(404).json({ error: '[!] Errore: utente non trovato' });

      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il recupero del profilo' });
    }
  }

  /**
   * Metodo che mostra l'elenco degli utenti a cui è possibile assegnare una issue
   * @param req 
   * @param res 
   */
  static async listAssignable(req: Request, res: Response) {
    try {
      return res.status(200).json(await userService.listAssignableUsers());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il recupero degli utenti' });
    }
  }
}

