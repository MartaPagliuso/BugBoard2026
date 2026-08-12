import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { UserService } from "../../services/user.service";
import { User, UserRole } from "../../models/user.model";

@Component({
  selector: 'app-users',
  imports: [FormsModule, DatePipe],
  templateUrl: './userts.html'
})
export class Users {
  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(true);
  panelOpen = signal(false);
  error = signal<string | null>(null);
  created = signal<{ email: string; password: string } | null>(null);

  nome = signal('');
  cognome = signal('');
  password = signal('');
  role = signal<'user' | 'viewer'>('user');
  saving = signal(false);

  readonly roleLabel: Record<string, string> = {
    admin: 'Amministratore',
    user: 'Utente',
    viewer: 'Sola lettura',
  };
  readonly roleClass: Record<string, string> = {
    admin: 'bg-plum-50 text-plum-600',
    user: 'bg-gray-100 text-gray-700',
    viewer: 'bg-gray-50 text-ink-mid',
  };

  readonly previewEmail = computed(() => {
    const slug = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
    const n = slug(this.nome());
    const c = slug(this.cognome());
    return n && c ? `${n}.${c}@bugboard.it` : '';
  });

  readonly canSubmit = computed(() => this.previewEmail() !== '' && this.password().length >= 8 && !this.saving());

  constructor() {
    this.loadUsers();
    this.generatePassword();
  }

  private loadUsers() {
    this.userService.list().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare gli utenti');
        this.loading.set(false);
      },
    });
  }

  togglePanel() {
    this.panelOpen.update((v) => !v);
    if (this.panelOpen()) {
      this.created.set(null);
      this.generatePassword();
    }
  }

  generatePassword() {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    this.password.set(Array.from(bytes, (b) => chars[b % chars.length]).join(''));
  }

  submit() {
    if (!this.canSubmit())
      return;

    this.saving.set(true);
    this.error.set(null);

    this.userService.create({
      nome: this.nome().trim(),
      cognome: this.cognome().trim(),
      password: this.password(),
      role: this.role(),
    }).subscribe({
      next: (user) => {
        this.users.update((list) => [user, ...list]);
        this.created.set({ email: user.email, password: this.password() });
        this.nome.set('');
        this.cognome.set('');
        this.panelOpen.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.error ?? 'Errore durante la creazione');
      },
    });
  }

  initials(u: User): string {
    if (!u.nome || !u.cognome)
      return '';

    return (u.nome[0] + u.cognome[0]).toUpperCase();
  }
}