import { eq, desc } from 'drizzle-orm';
import { db } from "../db/db.js";
import { issues, type InsertIssue } from "../db/schema/issues.js";

/**
 * Metodo che permette di salvare una nuova issue sul db
 * @param issue 
 */
export async function insertIssue(issue: InsertIssue) {
  const [created] = await db.insert(issues).values(issue).returning();
  return created;
}

/**
 * Metodo per cercare una issue in base al suo id
 * @param id 
 * @returns 
 */
export async function findIssueById(id: string) {
  const [issue] = await db.select().from(issues).where(eq(issues.id, id)).limit(1);
  return issue;
}

/**
 * Metodo che restituisce tutte le issue salvate nel db
 * @returns 
 */
export async function findAllIssue() {
  return db.select().from(issues).orderBy(desc(issues.createdAt));
}