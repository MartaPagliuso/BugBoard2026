import { pgTable as table, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { issues } from "./issues.js"
import { users } from "./users.js"

export const comments = table('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  body: text('body').notNull(),
  issueId: uuid('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type SelectComment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;