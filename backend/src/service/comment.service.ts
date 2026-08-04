import * as issueRepository from "../repository/issues.repository.js";
import * as commentRepository from "../repository/comments.repository.js";

/**
 * Servizio che permette di inserire un nuovo commento
 * @param issueId 
 * @param body 
 * @param authorId 
 * @returns 
 */
export async function createComment(issueId: string, body: string, authorId: string) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata');

  return commentRepository.insertComment({ issueId, body, authorId });
}

export async function listCommentsByIssue(issueId: string) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata');

  return commentRepository.findCommentByIssueId(issueId);
}