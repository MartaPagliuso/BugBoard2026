import { db } from "../db/db.js";
import { comments, InsertComment } from "../db/schema/comments.js";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/users.js";

/**
 * Metodo per la creazione di un nuovo commento
 * @param comment 
 * @returns 
 */
export async function insertComment(comment: InsertComment) {
  const [created] = await db.insert(comments).values(comment).returning();
  if (!created)
    return created;

  const [withAuthor] = await db.select({
    id: comments.id,
    body: comments.body,
    createdAt: comments.createdAt,
    author : {
      id: users.id,
      nome: users.nome,
      cognome: users.cognome
    },
  })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.id, created.id))
    .limit(1);

  return withAuthor;
}

/**
 * Metodo che restituisce i commenti di una determinata issue
 * @param issueId 
 * @returns 
 */
export async function findCommentByIssueId(issueId: string) {
  return db.select({
    id: comments.id,
    body: comments.body,
    createdAt: comments.createdAt,
    author: {
      id: users.id,
      nome: users.nome,
      cognome: users.cognome,
    },
  })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.issueId, issueId))
    .orderBy(comments.createdAt);
}
