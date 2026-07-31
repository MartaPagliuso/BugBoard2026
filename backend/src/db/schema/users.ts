import { pgEnum, pgTable as table, uuid, boolean, timestamp, text } from "drizzle-orm/pg-core";

export const userRole = pgEnum('roles', ['user', 'admin']);

export const users = table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  cognome: text('cognome').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRole('role').notNull().default('user'),
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  refreshTokenHash: text('refresh_token_hash')
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

