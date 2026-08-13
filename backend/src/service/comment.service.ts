import * as issueRepository from "../repository/issues.repository.js";
import { CommentRepository } from "../repository/comments.repository.js";

export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Servizio che permette di inserire un nuovo commento
   * @param issueId 
   * @param body 
   * @param authorId 
   * @returns 
   */
  async createComment(issueId: string, body: string, authorId: string) {
    const issue = await issueRepository.findIssueById(issueId);
    if (!issue)
      throw new Error('[!] Issue non trovata');
  
    return this.commentRepository.insert({ issueId, body, authorId });
  }

  /**
   * Servizio che mostra i commenti di una determinata issue
   * @param issueId 
   * @returns 
   */
  async listCommentsByIssue(issueId: string) {
    const issue = await issueRepository.findIssueById(issueId);
    if (!issue)
      throw new Error('[!] Issue non trovata');
  
    return this.commentRepository.findByIssueId(issueId);
  }

}

