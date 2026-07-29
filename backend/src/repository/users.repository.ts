import { db } from "../db/db.js";
import { users, type InsertUser } from "../db/schema/users.js";

/**
 * Metodo per la creazione di un nuovo utente
 * @param user 
 */
export async function createUser(user: InsertUser) {
  await db.insert(users).values(user);
}