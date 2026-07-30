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

/**
 * Metodo che cerca un utente tramite la sua email
 * @param email 
 * @returns 
 */
export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

/**
 * Metodo che permette di trovare un utente tramite il suo id
 * @param id 
 * @returns 
 */
export async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

/**
 * Metodo che permette di fare l'update della password
 * @param id 
 * @param password 
 */
export async function updatePassword(id: string, password: string) {
  await db.update(users)
    .set({
      password: password,
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));
}

/**
 * Metodo che setta il refresh_token nel db
 * @param id 
 * @param hash 
 */
export async function setRefreshTokenHash(id: string, hash: string | null) {
  await db
    .update(users)
    .set({ refreshTokenHash: hash, updatedAt: new Date() })
    .where(eq(users.id, id));
}

/**
 * Metodo che permette di trovare un utente in base al suo refresh_token
 * Serve per cercare un utente senza affidarsi ai dati del client
 * @param hash 
 * @returns 
 */
export async function findUserByRefreshToken(hash: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.refreshTokenHash, hash))
    .limit(1);
  
  return user;
}