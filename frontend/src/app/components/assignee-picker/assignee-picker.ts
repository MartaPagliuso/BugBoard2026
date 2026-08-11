import { Component, inject, signal, computed, input, output, HostListener, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UserService } from "../../services/user.service";
import { IssueService } from "../../services/issue.service";
import { AssignableUser } from "../../models/user.model";
import { Issue } from "../../models/issue.model";

@Component({
  selector: 'app-assignee-picker',
  imports: [FormsModule],
  templateUrl: './assignee-picker.html'
})
export class AssigneePicker {
  private readonly userService = inject(UserService);
  private readonly issueService = inject(IssueService);
  private readonly host = inject(ElementRef);

  readonly issue = input.required<Issue>();
  readonly assigned = output<Issue>();

  open = signal(false);
  query = signal('');
  users = signal<AssignableUser[]>([]);
  loading = signal(false);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q)
      return this.users();

    return this.users().filter((u) => `${u.nome} ${u.cognome} ${u.email}`.toLowerCase().includes(q));
  });

  readonly assignedInitials = computed(() => {
    const a = this.issue().assignee;
    if (!a.nome || !a.cognome)
      return '';

    return (a.nome[0] + a.cognome[0].toUpperCase());
  });

  readonly assignedName = computed(() => {
    const a = this.issue().assignee;
    return a.nome ? `${a.nome} ${a.cognome}` : '';
  });

  toggle() {
    this.open.update((v) => !v);
    if (this.open() && this.users().length === 0){
      this.loading.set(true);
      this.userService.listAssignable().subscribe({
        next: (list) => {
          this.users.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  select(userId: string) {
    this.issueService.assign(this.issue().id, userId).subscribe({
      next: (update) => {
        this.assigned.emit(update);
        this.open.set(false);
        this.query.set('');
      },
    });
  }

  fullName(user: AssignableUser) {
    return `${user.nome} ${user.cognome}`;
  }

  initials(user: AssignableUser) {
    return (user.nome[0] + user.cognome[0]).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target)) 
      this.open.set(false);
  }
}