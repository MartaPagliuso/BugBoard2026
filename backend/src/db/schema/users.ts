import { pgEnum, pgTable as table, uuid, boolean, timestamp, text } from "drizzle-orm/pg-core";

export const userRole = pgEnum('roles', ['user', 'admin']);

export const users = table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: userRole('role').notNull().default('user'),
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

