import { pgTable as table, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { issues } from './issues.js'

export const notifications = table('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientId: uuid('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  issueId: uuid('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type SelectNotification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;