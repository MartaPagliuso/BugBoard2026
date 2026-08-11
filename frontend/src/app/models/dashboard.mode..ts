export interface DashboardSummary {
  openIssues: number;
  unassigned: number;
  overdue: number;
  avgResolutionHours: number | null;
}

export interface CountByKey {
  total: number;
}

export interface StatusCount extends CountByKey {
  status: string;
}

export interface TypeCount extends CountByKey {
  type: string;
}

export interface PriorityCount extends CountByKey {
  priority: string;
}

export interface AssignedPerUser {
  userId: string;
  email: string;
  nome: string;
  cognome: string;
  assigned: number;
}

export interface ResolutionPerUser {
  userId: string;
  email: string;
  nome: string;
  cognome: string;
  resolved: number;
  avgResolutionHours: number | null;
}

export interface DashboardStats {
  summary: DashboardSummary;
  byStatus: StatusCount[];
  byType: TypeCount[];
  byPriority: PriorityCount[];
  assignedPerUser: AssignedPerUser[];
  totalAssignableUsers: number;
  resolutionPerUser: ResolutionPerUser[];
}