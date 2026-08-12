import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../db/db.js';
import { notifications, type InsertNotification } from '../db/schema/notifications.js';

/**
 * Metodo per la creazione di una nuova notifica
 * @param notification 
 * @returns 
 */
export async function insertNotification(notification: InsertNotification) {
  const [created] = await db.insert(notifications).values(notification).returning();
  return created;
}

/**
 * Metodo che recupera le notifiche di uno specifico destinatario ordinate dalla più recente
 * @param recipientId 
 * @param onlyUnread 
 * @returns 
 */
export async function findByRecipient(recipientId: string, onlyUnread = false, limit = 20) {
  const conditions = [eq(notifications.recipientId, recipientId)];
  if (onlyUnread)
    conditions.push(eq(notifications.read, false));

  return db.select().from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function countByRecipient(recipientId: string) {
  const [row] = await db.select({ value: count() })
    .from(notifications)
    .where(eq(notifications.recipientId, recipientId));

  return row?.value ?? 0;
}

/**
 * Metodo che conta quante notifiche sono ancora da leggere
 * @param recipientId 
 * @returns 
 */
export async function countUnread(recipientId: string) {
  const [row] = await db.select({ value: count() })
    .from(notifications)
    .where(and(
      eq(notifications.recipientId, recipientId),
      eq(notifications.read, false),
    ));

  return row?.value ?? 0;
}

/**
 * Metodo che marca una notifica come letta
 * @param id 
 * @param recipientId 
 * @returns 
 */
export async function markAsRead(id: string, recipientId: string) {
  const [updated] = await db.update(notifications)
    .set({ read: true })
    .where(and(
      eq(notifications.id, id),
      eq(notifications.recipientId, recipientId),
    ))
    .returning();

  return updated;
}

/**
 * Metodo che marca tutte le notifiche come lette
 * @param recipientId 
 */
export async function markAllAsRead(recipientId: string) {
  await db.update(notifications)
    .set({ read: true })
    .where(and(
      eq(notifications.recipientId, recipientId),
      eq(notifications.read, false),
    ));
}