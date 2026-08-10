export type IssueType = 'question' | 'bug' | 'documentation' | 'feature';
export type IssueStatus = 'todo' | 'in_progress' | 'done' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface IssuePerson {
  id: string | null;
  nome: string | null;
  cognome: string | null;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority | null;
  imageUrl: string | null;
  dueDate: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: IssuePerson;
  assignee: IssuePerson
  commentCount: number;
}

export interface IssueFilters {
  q?: string;
  status?: IssueStatus;
  type?: IssueType;
  priority?: IssuePriority;
}