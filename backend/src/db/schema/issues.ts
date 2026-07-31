import { pgEnum, pgTable as table, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const issueType = pgEnum('issue_type', ['question', 'bug', 'documentation', 'feature']);
export const issueStatus = pgEnum('issue_status', ['todo', 'in_progress', 'done', 'closed']);
export const issuePriority = pgEnum('issue_priority', ['low', 'medium', 'high', 'critical']);

export const issues = table('issues', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: issueType('type').notNull(),
  status: issueStatus('status').notNull().default('todo'),
  priority: issuePriority('priority'),
  imageUrl: text('image_url'),
  
  authorId: uuid('author_id').notNull().references(() => users.id),
  assigneeId: uuid('assignee_id').notNull().references(() => users.id),

  dueDate: timestamp('due_date', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true}),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type SelectIssue = typeof issues.$inferSelect;
export type InsertIssue = typeof issues.$inferInsert;