import { type Request, type Response } from "express";
import { createUser } from "../repository/users.repository.js";

export class UserController {
  /**
   * Metodo per la creazione di un nuovo utente
   * @param req 
   * @param res 
   */
  static async createUserController(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;

      // delego l'operazione sul db al repository
      await createUser({ email, password, role });

      res.status(201).json({ message: 'Utente creato con successo.' });
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione di un nuovo utente.' });
    }
  }
}

