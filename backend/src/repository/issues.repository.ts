import { eq, desc, and, or, ilike, count, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from "../db/db.js";
import { issues, type InsertIssue } from "../db/schema/issues.js";
import { users } from '../db/schema/users.js';
import { comments } from '../db/schema/comments.js';

export type IssueFilters = {
  q?: string;
  status?: 'todo' | 'in_progress' | 'done' | 'closed';
  type?: 'question' | 'bug' | 'documentation' | 'feature';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  authorId?: string;
}

const author = alias(users, 'author');
const assignee = alias(users, 'assignee');

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
export async function findIssues(filters: IssueFilters = {}) {
  const conditions: SQL[] = [];

  if (filters.q) {
    const pattern = `%${filters.q}%`;
    conditions.push(or(
      ilike(issues.title, pattern),
      ilike(issues.description, pattern),
    )!);
  }

  if (filters.status) conditions.push(eq(issues.status, filters.status));
  if (filters.type) conditions.push(eq(issues.type, filters.type));
  if (filters.priority) conditions.push(eq(issues.priority, issues.priority));
  if (filters.assigneeId) conditions.push(eq(issues.assigneeId, filters.assigneeId));
  if (filters.authorId) conditions.push(eq(issues.authorId, filters.authorId));

  return db.select({
    id: issues.id,
    title: issues.title,
    description: issues.description,
    type: issues.type,
    status: issues.status, 
    priority: issues.priority,
    imageUrl: issues.imageUrl,
    dueDate: issues.dueDate,
    resolvedAt: issues.resolvedAt,
    createdAt: issues.createdAt,
    updatedAt: issues.updatedAt,
    author: {
      id: author.id,
      nome: author.nome,
      cognome: author.cognome,
    },
    assignee: {
      id: assignee.id,
      nome: assignee.nome,
      cognome: assignee.cognome,
    },
    commentCount: count(comments.id),
  })
    .from(issues)
    .innerJoin(author, eq(issues.authorId, author.id))
    .leftJoin(assignee, eq(issues.assigneeId, assignee.id))
    .leftJoin(comments, eq(comments.issueId, issues.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(issues.id, author.id, assignee.id)
    .orderBy(desc(issues.createdAt));
}

/**
 * Una sola funzione per tutti gli aggiornamenti
 * @param id 
 * @param data 
 * @returns 
 */
export async function updateIssue(id: string, data: Partial<InsertIssue>) { // il repository resta ignorante su quali campi cambiano, decide il service
  const [updated] = await db.update(issues).set(data).where(eq(issues.id, id)).returning();
  return updated;
}

/**
 * Metodo che permette l'eliminazione di una issue
 * @param id 
 */
export async function deleteIssue(id: string) {
  await db.delete(issues).where(eq(issues.id, id));
}