import { eq } from 'drizzle-orm';
import { db } from "../db/db.js";
import { users, type InsertUser } from "../db/schema/users.js";

/**
 * Metodo per la creazione di un nuovo utente
 * @param user 
 */
export async function insertUser(user: InsertUser) {
  const [created] = await db.insert(users).values(user).returning({
    id: users.id,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  });
  return created;
}

