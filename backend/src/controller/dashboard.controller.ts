import { type Request, type Response } from 'express';
import { dashboardService } from '../container.js';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      return res.status(200).json(await dashboardService.getDashboardStats());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore durante il recupero delle statistiche.' });
    }
  }
}