import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { NotificationBell } from "../components/notification-bell/notification-bell";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationBell],
  templateUrl: './layout.html',
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly isAdmin = this.auth.isAdmin;
  readonly isViewer = this.auth.isViewer;
  readonly initials = this.auth.initials;
  readonly fullName = this.auth.fullName;

  menuOpen = signal(false);

  readonly roleLabel: Record<string, string> = {
    admin: 'Amministratore',
    user: 'Utente',
    viewer: 'Sola lettura',
  };

  logout() {
    this.menuOpen.set(false);
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}