import { Component, inject, signal, computed } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import { DashboardStats } from "../../models/dashboard.mode.";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly statusLabel: Record<string, string> = { todo: 'Todo', in_progress: 'In corso', done: 'Risolte', closed: 'Chiuse' };
  readonly statusColor: Record<string, string> = { todo: '#9AA3B2', in_progress: '#4A8BDF', done: '#1D9E75', closed: '#6B7280' };

  readonly typeLabel: Record<string, string> = { bug: 'Bug', feature: 'Funzionalità', question: 'Domanda', documentation: 'Documentazione' };
  readonly typeColor: Record<string, string> = { bug: '#C2410C', feature: '#1D9E75', question: '#534AB7', documentation: '#185FA5' };

  readonly totalIssues = computed(() => this.stats()?.byStatus.reduce((sum, s) => sum + s.total, 0) ?? 0);

  constructor() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare le statistiche');
        this.loading.set(false);
      },
    });
  }

  percent(value: number): number {
    const total = this.totalIssues();
    return total === 0 ? 0 : Math.round((value/total) * 100);
  }

  initials(nome: string, cognome: string): string {
    if (!nome || !cognome)
      return '';

    return (nome[0] + cognome[0]).toUpperCase();
  }
}