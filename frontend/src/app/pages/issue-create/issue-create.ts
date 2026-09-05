import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { IssueService } from "../../services/issue.service";
import { IssueType, IssuePriority } from "../../models/issue.model";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: 'app-issue-create',
  imports: [FormsModule, RouterLink],
  templateUrl: './issue-create.html',
})
export class IssueCreate {
  private readonly issueService = inject(IssueService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  title = signal('');
  description = signal('');
  type = signal<IssueType | null>(null);
  priority = signal<IssuePriority | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  readonly maxTitle = 200;
  readonly canSubmit = computed(() => 
    this.title().trim().length >= 3 && 
    this.title().length <= this.maxTitle &&
    this.description().trim().length > 0 &&
    !this.loading(), 
  );

  readonly types: { value: IssueType; label: string; hint: string }[] = [
    { value: 'bug', label: 'Bug', hint: 'Malfunzionamento' },
    { value: 'question', label: 'Domanda', hint: 'Chiarimento' },
    { value: 'documentation', label: 'Documentazione', hint: 'Manuali, guide' },
    { value: 'feature', label: 'Funzionalità', hint: 'Nuova richiesta' },
  ];

  readonly priorities: { value: IssuePriority | null; label: string }[] = [
    { value: null, label: 'Non indicata' },
    { value: 'low', label: 'Bassa' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Critica' },
  ];

  submit() {
    if (!this.canSubmit())
      return;

    this.error.set(null);
    this.loading.set(true);

    this.issueService.create({
      title: this.title().trim(),
      description: this.description().trim(),
      type: this.type()!,
      ...(this.priority() ? { priority: this.priority()! } : {}),
    }).subscribe({
      next: (issue) => {
        this.toast.success('Segnalazione creata.');
        this.router.navigate(['/issues', issue.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 403 ? 'Non hai i permessi per creare segnalazioni' : err.error?.error ?? 'Errore durante la creazione',
        );
      },
    });
  }
}