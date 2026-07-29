import { type Request, type Response } from "express";
import * as userService from '../service/user.service.js';
import {email, z} from 'zod';

// serve per valida l'input
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export class UserController {
  /**
   * Metodo per la creazione di un nuovo utente
   * @param req 
   * @param res 
   */
  static async createUserController(req: Request, res: Response) {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success)
      return res.status(400).json({ error: '[!] Dati non validi', details: parsed.error.flatten() });

    try {
      const user = await userService.createUser(parsed.data);
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore durante la creazione di un nuovo utente.' });
    }
  }
}

