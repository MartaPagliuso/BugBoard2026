import * as dashboardRepository from "../repository/dashboard.repository.js";

const toHours = (seconds: number | null) => 
  seconds === null ? null : Math.round((seconds / 3600) * 100) / 100;

/**
 * Servizio che restituisce le statistiche per la dashboard
 * @returns 
 */
export async function getDashboardStats() {
  const [
    openIssues,
    byStatus,
    byType,
    byPriority,
    assignedPerUser,
    avgSeconds,
    avgPerUser,
    overdue,
    unassigned,
    totalUsers,
  ] = await Promise.all([
    dashboardRepository.countOpenIssues(),
    dashboardRepository.countByStatus(),
    dashboardRepository.countByType(),
    dashboardRepository.countByPriority(),
    dashboardRepository.countAssignedPerUser(),
    dashboardRepository.avgResolutionSeconds(),
    dashboardRepository.avgResolutionSecondsPerUser(),
    dashboardRepository.countOverdue(),
    dashboardRepository.countUnassigned(),
    dashboardRepository.countAssignableUsers()
  ]);

  return {
    summary: {
      openIssues,
      unassigned,
      overdue,
      avgResolutionHours: toHours(avgSeconds),
    },
    byStatus,
    byType,
    byPriority,
    assignedPerUser,
    totalAssignableUsers: totalUsers,
    resolutionPerUser: avgPerUser.map((row) => ({
      userId: row.userId,
      email: row.email,
      resolved: row.resolved,
      avgResolutionHours: toHours(row.avgSeconds ? Number(row.avgSeconds) : null),
    })),
  }
}