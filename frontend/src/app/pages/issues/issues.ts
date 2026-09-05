import { Component, inject, signal, computed, effect, untracked } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { takeUntilDestroyed, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, switchMap, startWith } from "rxjs";
import { IssueService } from "../../services/issue.service";
import { AuthService } from "../../services/auth.service";
import { Issue, IssueStatus, IssueType, IssuePriority, IssuePerson } from "../../models/issue.model";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-issues',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './issues.html',
})
export class Issues {
  private readonly issueService = inject(IssueService);
  private readonly auth = inject(AuthService);

  readonly isViewer = this.auth.isViewer;

  search = signal('');
  statusFilter = signal<IssueStatus | null>(null);
  typeFilter = signal<IssueType | null>(null);
  priorityFilter = signal<IssuePriority | null>(null);
  loading = signal(true);
  assigneeFilter = signal<string | null> (null);
  
  readonly currentUser = this.auth.currentUser;
  readonly onlyMine = computed(() => this.assigneeFilter() !== null);
  readonly issues = signal<Issue[]>([]);

  page = signal(1);
  total = signal(0);
  readonly limit = 10;

  private readonly filters = computed(() => ({
    q: this.search() || undefined,
    status: this.statusFilter() ?? undefined,
    type: this.typeFilter() ?? undefined,
    priority: this.priorityFilter() ?? undefined,
    assigneeId: this.assigneeFilter() ?? undefined,
  }));

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  constructor() {
    toObservable(computed(() => ({ filters: this.filters(), page: this.page() })))
      .pipe(
        debounceTime(300),
        switchMap(({ filters, page }) => this.issueService.list(filters, page, this.limit)),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.issues.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);

      })

    effect(() => {
      this.search();
      this.statusFilter();
      this.typeFilter();
      this.priorityFilter();
      this.assigneeFilter();
      untracked(() => this.page.set(1));
    });
  }

  readonly openCount = computed(() => this.issues().filter((i) => i.status !== 'done' && i.status !== 'closed').length);
  
  readonly statusLabel: Record<IssueStatus, string> = {
    todo: 'Todo',
    in_progress: 'In corso',
    done: 'Risolto',
    closed: 'Chiusa',
  };
  readonly statusClass: Record<IssueStatus, string> = {
    todo: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-50 text-green-800',
    closed: 'bg-gray-200 text-gray-700',
  };

  readonly priorityLabel: Record<IssuePriority, string> = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
    critical: 'Critica',
  };
  readonly priorityClass: Record<IssuePriority, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-amber-50 text-amber-800',
    high: 'bg-orange-100 text-orange-900',
    critical: 'bg-red-100 text-red-900',
  };

  readonly typeLabel: Record<IssueType, string> = {
    question: 'Domanda',
    bug: 'Bug',
    documentation: 'Documentazione',
    feature: 'Funzionalità',
  };

  toggleOnlyMine() {
    this.assigneeFilter.set(this.onlyMine() ? null : this.currentUser()?.id ?? null);
  }
  
  /**
   * Metodo che prende solo le iniziali di un utente
   * @param p 
   * @returns 
   */
  initials(p: IssuePerson | null): string {
    if (!p?.nome || !p?.cognome)
      return '';

    return (p.nome[0] + p.cognome[0]).toUpperCase();
  }

  /**
   * Metodo che restituisce il nome intero
   * @param p 
   */
  fullName(p:IssuePerson | null): string {
    return p?.nome ? `${p.nome} ${p.cognome}` : '';
  }

  /**
   * Metodo che mostra se una issue è scaduta o meno
   * @param issue 
   */
  isOverdue(issue:Issue): boolean {
    return !!issue.dueDate && !issue.resolvedAt && new Date(issue.dueDate) < new Date();
  }

  setStatus(s: IssueStatus | null) {
    this.statusFilter.set(s);
  }
}