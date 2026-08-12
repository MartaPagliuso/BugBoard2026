import * as issueRepository from "../repository/issues.repository.js";
import * as userRepository from "../repository/users.repository.js";
import { type IssueFilters } from "../repository/issues.repository.js";
import * as notificationService from './notification.service.js';

import sharp from 'sharp';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { UserRole } from "../db/schema/users.js";

import { type IssueType, type IssuePriority } from '../db/schema/issues.js';

const UPLOAD_DIR = path.resolve('uploads', 'issues');

export type UpdateIssueInput = {
  title?: string, 
  description?: string, 
  type?: IssueType,
  priority?: IssuePriority | null,
};

export type CreateIssueInput = {
  title: string;
  description: string;
  type: 'question' | 'bug' | 'documentation' | 'feature';
  priority?: 'low' | 'medium' | 'high' | 'critical';
};

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
 * Servizio che permette di cercare una issue dal suo id
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
 * Servizio che mostra l'elenco di tutte le issue
 * @returns 
 */
export async function listIssues(filters: IssueFilters = {}, page = 1, limit = 20) {
  return issueRepository.findIssues(filters, page, limit);
}

/**
 * Servizio che permette di assegnare una issue a un utente
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

  await issueRepository.updateIssue(issueId, {
    assigneeId,
    updatedAt: new Date(),
  });

  return issueRepository.findIssueById(issueId);
}

/**
 * Servizio che aggiorna lo stato della issue
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
    throw new Error('[!] Vietato');

  const resolvedAt = newStatus === 'done' && !issue.resolvedAt ? new Date() : issue.resolvedAt;

  await issueRepository.updateIssue(issueId, {
    status: newStatus,
    resolvedAt,
    updatedAt: new Date(),
  });

  if (newStatus === 'done' && issue.status !== 'done') {
    try {
      await notificationService.notifyIssueResolved(issue, userId);
    } catch (error) {
      console.error('Notifica fallita: ', error);
    }
  }

  return issueRepository.findIssueById(issueId);
}

/**
 * Servizio che aggiorna la data di scadenza di una specifica attività nel database
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

  await issueRepository.updateIssue(issueId, {
    dueDate, 
    updatedAt: new Date(),
  });

  return issueRepository.findIssueById(issueId);
}

/**
 * Servizio che setta l'immagine per una issue
 * Viene salvato nel db solo il nome del file, non il percorso completo
 * @param issueId 
 * @param buffer 
 * @param userId 
 * @param userRole 
 * @returns 
 */
export async function setIssueImage(issueId: string, buffer: Buffer, userId: string, userRole: UserRole) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata');

  if (issue.authorId !== userId && userRole !== 'admin')
    throw new Error('[!] Vietato')

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}.webp`;

  try {
    await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOAD_DIR, filename));
  } catch {
    throw new Error('[!] Immagine non valida')
  }

  // rimuove la precedente, se c'era
  if (issue.imageUrl)
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(issue.imageUrl))).catch(() => {});

  await issueRepository.updateIssue(issueId, { imageUrl: filename, updatedAt: new Date() });

  return issueRepository.findIssueById(issueId);
}

/**
 * Servizio che prende il percorso di una immagina di una issue
 * @param issueId 
 */
export async function getIssueImagePath(issueId: string) {
  const issue = await issueRepository.findIssueById(issueId);

  if (!issue) throw new Error('[!] Issue non trovata');
  if (!issue.imageUrl) throw new Error('[!] Immagine non trovata');

  return path.join(UPLOAD_DIR, path.basename(issue.imageUrl));
}

/**
 * Servizio per l'update di una issue
 * @param issueId 
 * @param input 
 * @param userId 
 * @param userRole 
 * @returns 
 */
export async function updateIssue(
  issueId: string,
  input: UpdateIssueInput,
  userId: string,
  userRole: UserRole,
) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata');

  const isAuthor = issue.authorId === userId;
  const isAdmin = userRole === 'admin';

  if (!isAuthor && !isAdmin)
    throw new Error('[!] Vietato')

  await issueRepository.updateIssue(issueId, {
    ...input,
    updatedAt: new Date(),
  });

  return issueRepository.findIssueById(issueId);
}

/**
 * Servizio che permette l'eliminazione di una issue
 * @param issueId 
 */
export async function deleteIssue(issueId: string) {
  const issue = await issueRepository.findIssueById(issueId);
  if (!issue)
    throw new Error('[!] Issue non trovata')

  if (issue.imageUrl)
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(issue.imageUrl))).catch(() => {});

  await issueRepository.deleteIssue(issueId);
}
