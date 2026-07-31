import { type Request, type Response } from "express";
import { z } from "zod";
import * as issueService from "../service/issue.service.js";

const createIssueSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(1),
  type: z.enum(['question', 'bug', 'documentation', 'feature']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export class IssueController {

  /**
   * Metodo per creare una nuova issue
   * @param req 
   * @param res 
   * @returns 
   */
  static async create(req: Request, res: Response) {
    const parsed = createIssueSchema.safeParse(req.body);

    if (!parsed.success)
      return res.status(400).json({ error: '[!] Errore: dati non validi', details: parsed.error. flatten() });
  
    try {
      const issue = await issueService.createIssue(parsed.data, req.user!.sub);
      return res.status(201).json(issue);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore durante la creazione della issue' });
    }
  }

  static async getById(req: Request, res: Response) {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success)
      return res.status(400).json({ error: '[!] ID della issue non valido'});

    try {
      return res.status(200).json(await issueService.getIssueById(parsed.data.id));
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Issue non trovata.')
        return res.status(404).json({ error: '[!] Issue non trovata' });

      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il recupero della issue.' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      return res.status(200).json(await issueService.listIssues());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il recupero delle issues.' });
    }
  }
}