import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { IssueService } from "../../services/issue.service";
import { AuthService } from "../../services/auth.service";
import { Issue, IssueStatus, IssueType, IssuePriority, IssuePerson } from "../../models/issue.model";
import { Comment } from "../../models/comment.model";
import { AssigneePicker } from "../../components/assignee-picker/assignee-picker";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-issue-detail',
  imports: [FormsModule, RouterLink, DatePipe, AssigneePicker],
  templateUrl: './issue-detail.html',
})
export class IssueDetail {
  private readonly issueService = inject(IssueService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  readonly issueId = this.route.snapshot.paramMap.get('id')!;
  readonly currentUser = this.auth.currentUser;
  readonly isAdmin = this.auth.isAdmin;
  readonly isViewer = this.auth.isViewer;
  readonly initials = this.auth.initials;

  issue = signal<Issue | null>(null);
  comments = signal<Comment[]>([]);
  newComment = signal('');
  loading = signal(true);
  error = signal<string | null>(null);
  sendingComment = signal(false);

  editing = signal(false);
  editTitle = signal('');
  editDescription = signal('');
  editType = signal<IssueType>('bug');
  editPriority = signal<IssuePriority | null>(null);
  savingEdit = signal(false);

  readonly maxTitle = 200;

  readonly types: IssueType[] = ['bug', 'question', 'documentation', 'feature'];
  readonly typeShort: Record<IssueType, string> = {
    bug: 'Bug',
    question: 'Domanda',
    documentation: 'Documentazione',
    feature: 'Funzionalità'
  };

  readonly priorities: (IssuePriority | null)[] = [null, 'low', 'medium', 'high', 'critical'];

  readonly isAuthor = computed(() => this.issue()?.authorId === this.currentUser()?.id);
  readonly isAssignee = computed(() => this.issue()?.assigneeId === this.currentUser()?.id);
  readonly canChangeStatus = computed(() => this.isAssignee() || this.isAdmin());
  readonly canEdit = computed(() => this.isAuthor() || this.isAdmin());

  readonly canSaveEdit = computed(() => 
    this.editTitle().trim().length >= 3 &&
    this.editTitle().length <= this.maxTitle &&
    this.editDescription().trim().length > 0 &&
    !this.savingEdit(),
  );

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

  readonly typeLabel: Record<IssueType, string> = {
    question: 'Domanda',
    bug: 'Bug',
    documentation: 'Documentazione',
    feature: 'Funzionalità',
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
    high: 'bg-red-50 text-red-800',
    critical: 'bg-red-100 text-red-900',
  };

  readonly statuses: IssueStatus[] = ['todo', 'in_progress', 'done', 'closed'];

  constructor() {
    this.load();
  }

  private load() {
    this.issueService.getById(this.issueId).subscribe({
      next: (issue) => {
        this.issue.set(issue);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Issue non trovata');
        this.loading.set(false);
      },
    });

    this.issueService.listComments(this.issueId).subscribe({
      next: (list) => this.comments.set(list),
    });
  }

  changeStatus(status: IssueStatus) {
    this.issueService.updateStatus(this.issueId, status).subscribe({
      next: (update) => this.issue.set({ ...this.issue()!, ...update }),
      error: (err) => this.error.set(err.error?.error ?? 'Errore durante il cambio di stato'),
    });
  }

  onAssigned(update: Issue) {
    this.issue.set(update);
  }

  sendComment() {
    const body = this.newComment().trim();
    if (!body || this.sendingComment())
      return;

    this.sendingComment.set(true);
    this.issueService.addComment(this.issueId, body).subscribe({
      next: (comment) => {
        this.comments.update((list) => [...list, comment]);
        this.newComment.set('');
        this.sendingComment.set(false); 
      },
      error: () => {
        this.sendingComment.set(false);
        this.error.set('Errore durante l\'invio del commento.');
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file)
      return;

    this.issueService.uploadImage(this.issueId, file).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.error ?? 'Errore durante il caricamento dell\'immagine'),
    });
    input.value = '';
  }

  deleteIssue() {
    if (!confirm('Eliminare definitivamente questa segnalazione?'))
      return;

    this.issueService.remove(this.issueId).subscribe({
      next: () => this.router.navigate(['/issues']),
      error: () => this.error.set('Errore durante l\'eliminazione'),
    });
  }

  personName(person: IssuePerson): string {
    return person?.nome ? `${person.nome} ${person.cognome}` : '';
  }

  personInitials(person: IssuePerson): string {
    if (!person.nome || !person.cognome)
      return '';

    return (person.nome[0] + person.cognome[0].toUpperCase());
  }

  setDueDate(value: string) {
    this.error.set(null);
    const iso = value ? new Date(value + 'T23:59:59').toISOString() : null;
    this.issueService.setDueDate(this.issueId, iso).subscribe({
      next: (update) => this.issue.set({ ...this.issue()!, ...update }),
      error: (err) => this.error.set(err.error?.error ?? 'Errore durante l\'impostazione della scadenza'),
    });
  }

  startEdit () {
    const issue = this.issue();

    if (!issue)
      return;

    this.editTitle.set(issue.title);
    this.editDescription.set(issue.description);
    this.editType.set(issue.type);
    this.editPriority.set(issue.priority);
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
    this.error.set(null);
  }

  saveEdit() {
    if (!this.canSaveEdit())
      return;

    this.savingEdit.set(true);
    this.issueService.update(this.issueId, {
      title: this.editTitle().trim(),
      description: this.editDescription().trim(),
      type: this.editType(),
      priority: this.editPriority(),
    }).subscribe({
      next: (update) => {
        this.issue.set(update);
        this.editing.set(false);
        this.savingEdit.set(false);
      },
      error: (err) => {
        this.savingEdit.set(false);
        this.error.set(err.error?.error ?? 'Errore durante il salvataggio delle modifiche');
      },
    });
  }

  priorityShort(priority: IssuePriority | null): string {
    return priority === null ? '-' : this.priorityLabel[priority];
  }

  imageUrl(id: string): string {
  return `${environment.apiUrl}/issues/${id}/image`;
}
}