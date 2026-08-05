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

const assignSchema = z.object({
  assigneeId: z.string().uuid(),
});

const statusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'closed']),
});

const issueFiltersSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'closed']).optional(),
  type: z.enum(['question', 'bug', 'documentation', 'feature']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigneeId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
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

  /**
   * Metodo che restituisce una issue tramite l'id
   * @param req 
   * @param res 
   * @returns 
   */
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

  /**
   * Metodo che mostra tutte le issue create
   * @param req 
   * @param res 
   * @returns 
   */
  static async list(req: Request, res: Response) {
    const parsed = issueFiltersSchema.safeParse(req.query);
    if (!parsed.success)
      return res.status(400).json({ error: '[!] Errore: filtri non validi.', details: parsed.error.flatten() });

    try {
      const issues = await issueService.listIssues(parsed.data);
      return res.status(200).json(issues);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante il recupero delle issues.' });
    }
  }

  /**
   * Metodo che assegna una issue a un utente
   * @param req 
   * @param res 
   * @returns 
   */
  static async assign(req: Request, res: Response) {
    const params = idParamSchema.safeParse(req.params);
    const body = assignSchema.safeParse(req.body);

    if (!params.success || !body.success)
      return res.status(400).json({ error: '[!] Errore: dati non validi.' });

    try {
      const issue = await issueService.assignIssue(params.data.id, body.data.assigneeId);
      return res.status(200).json(issue);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === '[!] Issue non trovata') return res.status(400).json({ error: '[!] Errore: issue non trovata.' });
        if (error.message === '[!] Assegnatario non trovato') return res.status(400).json({ error: '[!] Errore: assegnatario non valido.' });
        if (error.message === '[!] Assegnatario non valido') return res.status(400).json({ error: '[!] Errore: assegnatario non valido.' });
      }

      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante l\'assegnazione' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    const params = idParamSchema.safeParse(req.params);
    const body = statusSchema.safeParse(req.body);

    if (!params.success || !body.success)
      return res.status(400).json({ error: '[!] Errore: dati non validi.' });

    try {
      const issue = await issueService.updateIssueStatus(
        params.data.id,
        body.data.status,
        req.user!.sub,
        req.user!.role,
      );

      return res.status(200).json(issue);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === '[!] Issue non trovata') return res.status(404).json({ error: 'Errore: issue non trovata.' });
        if (error.message === '[!] Vietato') return res.status(403).json({ error: 'Errore: Solo l\'assegnatario può modificare lo stato.'});
      }

      console.error(error);
      return res.status(500).json({ error: 'Errore durante l\'aggiornamento dello stato.' });
    }
  }
}