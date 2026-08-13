import { z } from "zod";
import { commentService } from "../container.js";
import { type Request, type Response } from "express";

const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export class CommentController {

  /**
   * Metodo che permette la creazione di un nuovo commento
   * @param req 
   * @param res 
   * @returns 
   */
  static async addComment(req: Request, res: Response) {
    const params = idParamSchema.safeParse(req.params);
    const parsedBody = createCommentSchema.safeParse(req.body);

    if (!params.success || !parsedBody.success)
      return res.status(400).json({ error: '[!] Errore: dati non validi' });

    try {
      const comment = await commentService.createComment(
        params.data.id,
        parsedBody.data.body,
        req.user!.sub,
      );

      return res.status(201).json(comment);
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Issue non trovata')
        return res.status(404).json({ error: '[!] Errore: issue non trovata'});

      console.error(error);
      return res.status(500).json({ error: '[!] Errore durante la creazione del commento' });
    }
  }

  static async listByIssue(req: Request, res: Response) {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success)
      return res.status(400).json({ erorr: '[!] Errore: id non valido'});

    try {
      const comments = await commentService.listCommentsByIssue(params.data.id);
      return res.status(200).json(comments);
    } catch (error) {
      if (error instanceof Error && error.message === '[!] Issue non trovata')
        return res.status(404).json({ error: '[!] Errore: issue non trovata' });

      console.error(error);
      return res.status(500).json({ error: 'Errore durante il recupero dei commenti.' });
    }
  }
}

