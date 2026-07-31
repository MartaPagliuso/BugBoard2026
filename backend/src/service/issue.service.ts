import * as issueRepository from "../repository/issues.repository.js";

export type CreateIssueInput = {
  title: string;
  description: string;
  type: 'question' | 'bug' | 'documentation' | 'feature';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Servizio che permette di creare una nuova issue
 * @param input 
 * @param authorId 
 * @returns 
 */
export async function createIssue(input: CreateIssueInput, authorId: string) {
  return issueRepository.insertIssue({
    title: input.title,
    description: input.description,
    type: input.type,
    priority: input.priority,
    authorId,
  });
}

/**
 * Metodo che permette di cercare una issue dal suo id
 * @param id 
 * @returns 
 */
export async function getIssueById(id: string) {
  const issue = await issueRepository.findIssueById(id);
  if (!issue)
    throw new Error('[!] Issue non trovata.');

  return issue;
}

export async function listIssues() {
  return issueRepository.findAllIssue();
}