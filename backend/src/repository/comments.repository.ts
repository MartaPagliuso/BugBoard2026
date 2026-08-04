import { db } from "../db/db.js";
import { comments, InsertComment } from "../db/schema/comments.js";
import { eq } from "drizzle-orm";

/**
 * Metodo per la creazione di un nuovo commento
 * @param comment 
 * @returns 
 */
export async function insertComment(comment: InsertComment) {
  const [created] = await db.insert(comments).values(comment).returning();
  return created;
}

/**
 * Metodo che restituisce i commenti di una determinata issue
 * @param issueId 
 * @returns 
 */
export async function findCommentByIssueId(issueId: string) {
  return db.select().from(comments).where(eq(comments.issueId, issueId)).orderBy(comments.createdAt);
}
