import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  error = signal<string | null>(null);
  loading = signal(false);

  submit() {
    if (!this.email() || !this.password() || this.loading())
      return

    this.error.set(null);
    this.loading.set(true);

    this.auth.login(this.email(), this.password()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate([res.user.mustChangePassword ? '/change-passoword' : '/issues']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.status === 401 ? 'Credenziali non valide' : 'Impossibile contattare il server. Riprova',);
      },
    });
  }
}