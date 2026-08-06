import * as issueRepository from "../repository/issues.repository.js";
import * as userRepository from "../repository/users.repository.js";

import { type IssueFilters } from "../repository/issues.repository.js";

export type CreateIssueInput = {
  title: string;
  description: string;
  type: 'question' | 'bug' | 'documentation' | 'feature';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

type IssueStatus = 'todo' | 'in_progress' | 'done' | 'closed';

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

/**
 * Mostra l'elenco di tutte le issue
 * @returns 
 */
export async function listIssues(filters: IssueFilters = {}) {
  return issueRepository.findIssues(filters);
}

/**
 * Metodo che permette di assegnare una issue a un utente
 * @param issueId 
 * @param assigneeId 
 */
export async function assignIssue(issueId: string, assigneeId: string) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata');

  const assignee = await userRepository.findUserById(assigneeId);
  if (!assignee)
    throw new Error('[!] Assegnatario non trovato');

  if (assignee.role === 'viewer')
    throw new Error('[!] Assegnatario non valido');

  return issueRepository.updateIssue(issueId, {
    assigneeId,
    updatedAt: new Date(),
  });
}

/**
 * Metodo che aggiorna lo stato della issue
 * @param issueId 
 * @param newStatus 
 * @param userId 
 * @param userRole 
 * @returns 
 */
export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  userId: string,
  userRole: 'viewer' | 'user' | 'admin',
) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata');

  const isAssignee = issue.assigneeId === userId;
  const isAdmin = userRole === 'admin';

  if (!isAssignee && !isAdmin)
    throw new Error('[!] Vietato')

  const resolvedAt = newStatus === 'done' && !issue.resolvedAt ? new Date() : issue.resolvedAt;

  return issueRepository.updateIssue(issueId, {
    status: newStatus,
    resolvedAt,
    updatedAt: new Date(),
  });
}

/**
 * Metodo che aggiorna la data di scadenza di una specifica attività nel database
 * @param issueId 
 * @param dueDate 
 * @returns 
 */
export async function setDueDate(issueId: string, dueDate: Date | null) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata');

  if (dueDate !== null && dueDate.getTime() <= Date.now())
    throw new Error('[!] Scadenza già trascorsa');

  return issueRepository.updateIssue(issueId, {
    dueDate, 
    updatedAt: new Date(),
  });
}

