import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Route, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-change-password',
  imports: [FormsModule],
  templateUrl: './change-password.html',
})
export class ChangePassword {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  showCurrent = signal(false);
  showNew = signal(false);
  error = signal<string | null>(null);
  loading = signal(false);

  readonly isLongEnough = computed(() => this.newPassword().length >= 8);
  readonly isDifferent = computed(() => this.newPassword().length > 0 && this.newPassword() !== this.currentPassword());
  readonly matches = computed(() => this.confirmPassword().length > 0 && this.newPassword() === this.confirmPassword());
  readonly canSubmit = computed(() => this.currentPassword().length > 0 && this.isLongEnough() && this.isDifferent() && this.matches() && !this.loading());

  submit() {
    if (!this.canSubmit())
      return;

    this.error.set(null);
    this.loading.set(true);

    this.auth.changePassword(this.currentPassword(), this.newPassword()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login'], { queryParams: {changed: '1'} });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 401 ? 'La password attuale non è corretta.' : err.error?.error ?? 'Errore durante il cambio password.',
        );
      },
    });
  }
}