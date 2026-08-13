import { DashboardRepository } from "../repository/dashboard.repository.js";

const toHours = (seconds: number | null) => 
  seconds === null ? null : Math.round((seconds / 3600) * 100) / 100;

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository){}

  /**
   * Servizio che restituisce le statistiche per la dashboard
   * @returns 
   */
  async getDashboardStats() {
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
      this.dashboardRepository.countOpenIssues(),
      this.dashboardRepository.countByStatus(),
      this.dashboardRepository.countByType(),
      this.dashboardRepository.countByPriority(),
      this.dashboardRepository.countAssignedPerUser(),
      this.dashboardRepository.avgResolutionSeconds(),
      this.dashboardRepository.avgResolutionSecondsPerUser(),
      this.dashboardRepository.countOverdue(),
      this.dashboardRepository.countUnassigned(),
      this.dashboardRepository.countAssignableUsers()
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

}

