import { NotificationRepository } from '../repository/notifications.repository.js';
import { type SelectIssue } from '../db/schema/issues.js';
import { UserRepository } from '../repository/users.repository.js';
import { MailService } from './mail.service.js';

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService
  ){}

  /**
   * Servizio che notifica quando la issue è stata risolta 
   * @param issue 
   * @param resolvedById 
   * @returns 
   */
  async notifyIssueResolved(issue: SelectIssue, resolvedById: string) {
    if(issue.authorId === resolvedById) return;
  
    const notification = await this.notificationRepository.insert({
      recipientId: issue.authorId,
      issueId: issue.id,
      message: `La issue "${issue.title}" che hai segnalato è stata risolta`,
    });
  
    try {
      const author = await this.userRepository.findById(issue.authorId);
      if (author)
        await this.mailService.sendIssueResolvedEmail(author.email, issue.title);
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
  async listNotifications(userId: string, onlyUnread: boolean) {
    const limit = 20;
  
    const [items, total] = await Promise.all([
      this.notificationRepository.findByRecipient(userId, onlyUnread, limit),
      this.notificationRepository.countByRecipient(userId)
    ]);
  
    return { items, total, limit: limit};
  }

  /**
   * Servizio che restituisce il numero di notifiche non lette
   * @param userId 
   * @returns 
   */
  async getUnreadCount(userId: string) {
    return this.notificationRepository.countUnread(userId);
  }

  /**
   * Servizio che marca una specifica notifica come letta
   * @param notificationId 
   * @param userId 
   * @returns 
   */
  async markAsRead(notificationId: string, userId: string) {
    const updated = await this.notificationRepository.markAsRead(notificationId, userId);
    if (!updated)
      throw new Error('[!] Notifica non trovata');
  
    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.markAllAsRead(userId);
  }
}