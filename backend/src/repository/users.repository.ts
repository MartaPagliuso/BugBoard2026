import { db } from "../db/db.js";
import { users, type InsertUser } from "../db/schema/users.js";

/**
 * Metodo che serve per creare un nuovo utente
 * @param user 
 */
export async function createUser(user: InsertUser) {
  await db.insert(users).values(user);
}