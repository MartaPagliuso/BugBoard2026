import { type Request, type Response } from "express";
import * as userService from '../service/user.service.js';
import {z} from 'zod';

export class UserController {
  /**
   * Metodo per la creazione di un nuovo utente
   * @param req 
   * @param res 
   */
  static async createUserController(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Errore durante la creazione di un nuovo utente.' });
    }
  }
}

