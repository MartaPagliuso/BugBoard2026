import { eq, and, count, avg, sql, isNotNull, isNull, notInArray, lt, ne, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { issues } from '../db/schema/issues.js';
import { users } from '../db/schema/users.js';

import { type IssueStatus } from '../db/schema/issues.js';

const CLOSED_STATUSES: IssueStatus[] = ['done', 'closed'];

/**
 * Metodo che conta le issue ancora aperte
 * @returns 
 */
export async function countOpenIssues() {
  const [row] = await db.select({ value: count() })
    .from(issues)
    .where(notInArray(issues.status, CLOSED_STATUSES));

    return row?.value ?? 0;
}

/**
 * Metodo che conta le issues in base allo stato
 * @returns 
 */
export async function countByStatus() {
  return db.select({ status: issues.status, total: count() })
    .from(issues)
    .groupBy(issues.status);
}

/**
 * Metodo che conta le issues in base al tipo
 * @returns 
 */
export async function countByType() {
  return db.select({ type: issues.type, total: count() })
    .from(issues)
    .groupBy(issues.type);
}

/**
 * Metodo che conta le issues in base alla priorità
 * @returns 
 */
export async function countByPriority() {
  return db.select({ priority: issues.priority, total: count() })
    .from(issues)
    .groupBy(issues.priority);
}

/**
 * Metodo che conta quante issue attive (non chiuse) sono attualmente in carico a ciascun utente
 * @param limit 
 * @returns 
 */
export async function countAssignedPerUser(limit = 5) {
  return db.select({
    userId: users.id,
    email: users.email,
    nome: users.nome,
    cognome: users.cognome,
    assigned: count(issues.id),
  })
    .from(users)
    .leftJoin(issues, and(eq(issues.assigneeId, users.id), notInArray(issues.status, CLOSED_STATUSES), ))
    .where(ne(users.role, 'viewer'))
    .groupBy(users.id, users.email, users.nome, users.cognome)
    .orderBy(desc(count(issues.id)))
    .limit(limit);
}

/**
 * Metodo che calcola il tempo medio di risoluzione delle issue in secondi
 * @returns 
 */
export async function avgResolutionSeconds() {
  const [row] = await db.select({
    value: avg(sql`EXTRACT(EPOCH FROM (${issues.resolvedAt} - ${issues.createdAt}))`),
  })
    .from(issues)
    .where(and(isNotNull(issues.resolvedAt), eq(issues.status, 'done')));

    return row?.value ? Number(row.value) : null;
}

/**
 * Metodo che calcola il tempo medio di risoluzione delle issue in secondi per utente
 * @returns 
 */
export async function avgResolutionSecondsPerUser() {
  return db.select({
    userId: users.id,
    email: users.email,
    nome: users.nome,
    cognome: users.cognome,
    avgSeconds: avg(sql`EXTRACT(EPOCH FROM (${issues.resolvedAt} - ${issues.createdAt}))`),
    resolved: count(issues.id),
  })
    .from(users)
    .innerJoin(issues, and(eq(issues.assigneeId, users.id), isNotNull(issues.resolvedAt), eq(issues.status, 'done')))
    .groupBy(users.id, users.email, users.nome, users.cognome);
}

/**
 * Metodo che calcola il numero totale di issue scadute
 * @returns 
 */
export async function countOverdue() {
  const [row] = await db.select({ value: count() })
    .from(issues)
    .where(and(
      isNotNull(issues.dueDate),
      lt(issues.dueDate, new Date()),
      isNull(issues.resolvedAt),
    ));

  return row?.value ?? 0;
}

/**
 * Metodo che calcola il numero di issue non assegnate a un utente
 * @returns 
 */
export async function countUnassigned() {
  const [row] = await db.select({ value: count() })
    .from(issues)
    .where(and(isNull(issues.assigneeId), notInArray(issues.status, CLOSED_STATUSES), ));
  
  return row?.value ?? 0;
}

/**
 * Metodo che conta il numero di utenti a cui è possibile assegnare una issue
 */
export async function countAssignableUsers() {
  const [row] = await db.select({ value: count() })
  .from(users)
  .where(ne(users.role, 'viewer'));
  return row?.value ?? 0;
}