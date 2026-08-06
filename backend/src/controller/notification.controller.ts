import { type Request, type Response } from 'express';
import { json, z } from 'zod';
import * as notificationService from '../service/notification.service.js';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const listQuerySchema = z.object({
  unread: z.enum(['true', 'false']).optional(),
});

export class NotificationController {
  /**
   * Metodo che mostra le notifiche
   * @param req 
   * @param res 
   */
  static async list(req: Request, res: Response) {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success)
      return res.status(400).json({ error: '[!] Errore: parametri non validi' });

    try {
      const items = await notificationService.listNotifications(
        req.user!.sub,
        parsed.data.unread === 'true',
      );

      return res.status(200).json(items);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il recupero delle notifiche' });
    }
  }

  /**
   * Metodo che conta il numero di notifiche non lette
   * @param req 
   * @param res 
   */
  static async unreadCount(req: Request, res: Response) {
    try {
      return res.status(200).json({ count: await notificationService.getUnreadCount(req.user!.sub) });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il conteggio delle notifiche non lette' });
    }
  }

  /**
   * Metodo che marca una specifica notifica come letta
   * @param req 
   * @param res 
   * @returns 
   */
  static async markAsRead(req: Request, res: Response) {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success)
      return res.status(400).json({ error: '[!] Errore: id non valido' });

    try {
      return res.status(200).json(await notificationService.markAsRead(parsed.data.id, req.user!.sub));
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Notifica non trovata')
        return res.status(404).json({ error: '[!] Errore: notifica non trovata' });

      console.error(error);
      return res.status(500).json({ error: 'Errore durante l\'aggiornamento dello stato della notifica' });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      await notificationService.markAllAsRead(req.user!.sub);
      return res.status(200).json({ message: 'Tutte le notifiche sono state segnate correttamente' });
    } catch (error) {
      console.error(error);
      return res.status(500),json({ error: '[!] Errore durante l\'aggiornamento delle notifiche' });
    }
  }
}
