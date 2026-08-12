import * as notificationRepository from '../repository/notifications.repository.js';
import { type SelectIssue } from '../db/schema/issues.js';
import * as userRepository from '../repository/users.repository.js';
import * as mailService from './mail.service.js';

/**
 * Servizio che notifica quando la issue è stata risolta 
 * @param issue 
 * @param resolvedById 
 * @returns 
 */
export async function notifyIssueResolved(issue: SelectIssue, resolvedById: string) {
  if(issue.authorId === resolvedById) return;

  const notification = await notificationRepository.insertNotification({
    recipientId: issue.authorId,
    issueId: issue.id,
    message: `La issue "${issue.title}" che hai segnalato è stata risolta`,
  });

  try {
    const author = await userRepository.findUserById(issue.authorId);
    if (author)
      await mailService.sendIssueResolvedEmail(author.email, issue.title);
  } catch (error) {
    console.error('[!] Invio email fallito: ', error);
  }

  return notification;
}

/**
 * Servizio che mostra le notifiche di un utente
 * @param userId 
 * @param onlyUnread 
 * @returns 
 */
export async function listNotifications(userId: string, onlyUnread: boolean) {
  const limit = 20;

  const [items, total] = await Promise.all([
    notificationRepository.findByRecipient(userId, onlyUnread, limit),
    notificationRepository.countByRecipient(userId)
  ]);

  return { items, total, limit: limit};
}

/**
 * Servizio che restituisce il numero di notifiche non lette
 * @param userId 
 * @returns 
 */
export async function getUnreadCount(userId: string) {
  return notificationRepository.countUnread(userId);
}

/**
 * Servizio che marca una specifica notifica come letta
 * @param notificationId 
 * @param userId 
 * @returns 
 */
export async function markAsRead(notificationId: string, userId: string) {
  const updated = await notificationRepository.markAsRead(notificationId, userId);
  if (!updated)
    throw new Error('[!] Notifica non trovata');

  return updated;
}

export async function markAllAsRead(userId: string) {
  await notificationRepository.markAllAsRead(userId);
}