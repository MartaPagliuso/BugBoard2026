import { describe, it, expect, vi } from "vitest";
import { DashboardService } from "../../src/service/dashboard.service";

function repositoryFinto(overrides: any = {}) {
  return {
    countOpenIssues: vi.fn().mockResolvedValue(0),
    countByStatus: vi.fn().mockResolvedValue([]),
    countByType: vi.fn().mockResolvedValue([]),
    countByPriority: vi.fn().mockResolvedValue([]),
    countAssignedPerUser: vi.fn().mockResolvedValue([]),
    avgResolutionSeconds: vi.fn().mockResolvedValue(null),
    avgResolutionSecondsPerUser: vi.fn().mockResolvedValue([]),
    countOverdue: vi.fn().mockResolvedValue(0),
    countUnassigned: vi.fn().mockResolvedValue(0),
    countAssignableUsers: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

// ------------ TEST DI GETDASHBOARDSTATS() ------------

describe('Dashboard.getDashboardStats', () => {
  // Percorso 1: i secondi vengono convertiti in ore
  it("Converte il tempo medio da secondi a ore", async () => {
    const repository: any = repositoryFinto({
      avgResolutionSeconds: vi.fn().mockResolvedValue(7200), // 2 ore
    });

    const service = new DashboardService(repository);

    const stats = await service.getDashboardStats();
    expect(stats.summary.avgResolutionHours).toBe(2);
  });

  // Percorso 2: il tempo medio viene arrotondato a 2 decimali
  it("Arrotonda il tempo medio a 2 decimali", async () => {
    const repository: any = repositoryFinto({
      avgResolutionSeconds: vi.fn().mockResolvedValue(5000), // 1,3888... ore
    });

    const service = new DashboardService(repository);

    const stats = await service.getDashboardStats();
    expect(stats.summary.avgResolutionHours).toBe(1.39);
  });

  // Percorso 3: nessuna issue viene risolta => il valore deve restare null, non essere 0
  it("Restituisce null se non ci sono issue risolte", async () => {
    const service = new DashboardService(repositoryFinto() as any);

    const stats = await service.getDashboardStats();
    expect(stats.summary.avgResolutionHours).toBeNull();
  });

  // Percorso 4: vengono mostrate tutte le metriche della dashboard
  it("Epone tutte le sezioni previste dalla dashboard", async () => {
    const service = new DashboardService(repositoryFinto() as any);

    const stats = await service.getDashboardStats();

    expect(stats).toHaveProperty('summary');
    expect(stats).toHaveProperty('byStatus');
    expect(stats).toHaveProperty('byType');
    expect(stats).toHaveProperty('byPriority');
    expect(stats).toHaveProperty('assignedPerUser');
    expect(stats).toHaveProperty('resolutionPerUser');
  });
});