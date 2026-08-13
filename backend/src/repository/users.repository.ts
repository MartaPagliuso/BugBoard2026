import { eq, ne } from 'drizzle-orm';
import { db } from "../db/db.js";
import { users, type InsertUser } from "../db/schema/users.js";

export class UserRepository {
  /**
   * Metodo per la creazione di un nuovo utente
   * @param user 
   */
  async insert(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning({
      id: users.id,
      nome: users.nome,
      cognome: users.cognome,
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
  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  /**
   * Metodo che permette di trovare un utente tramite il suo id
   * @param id 
   * @returns 
   */
  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }
  
  /**
   * Metodo che permette di fare l'update della password
   * @param id 
   * @param password 
   */
  async updatePassword(id: string, password: string) {
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
  async setRefreshTokenHash(id: string, hash: string | null) {
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
  async findByRefreshToken(hash: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.refreshTokenHash, hash))
      .limit(1);
    
    return user;
  }

  /**
   * Metodo che restituisce l'elenco di tutti gli utenti
   */
  async findAll() {
    return db.select({
      id: users.id,
      nome: users.nome,
      cognome: users.cognome,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.email);
  }

  /**
   * Metodo che trova gli utenti a cui è possibile assegnare una issue
   */
  async findAssignable() {
    return db.select({
      id: users.id,
      nome: users.nome, 
      cognome: users.cognome,
      email: users.email,
    })
      .from(users)
      .where(ne(users.role, 'viewer'))
      .orderBy(users.cognome);
  }
}