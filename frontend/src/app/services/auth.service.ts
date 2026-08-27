import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap, catchError, of } from "rxjs";
import { User } from "../models/user.model";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  readonly currentUser = signal<User | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isViewer = computed(() => this.currentUser()?.role === 'viewer');

  readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return (user.nome[0] ?? '').concat(user.cognome[0] ?? '').toUpperCase();
  });

  readonly fullName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.nome} ${user.cognome}` : '';
  })

  /**
   * Servizio che permette di effettuare il login
   * @param email 
   * @param password 
   * @returns 
   */
  login(email: string, password: string) {
    return this.http
      .post<{ user: User }>(`${this.base}/auth/login`, { email, password })
      .pipe(tap((res) => this.currentUser.set(res.user)));
  }

  /**
   * Servizio che permette di effettuare il logout
   */
  logout() {
    return this.http
      .post(`${this.base}/auth/logout`, {})
      .pipe(tap(() => this.currentUser.set(null)));
  }

  /**
   * Servizio che scarica le informazioni dell'utente
   * Se qualcosa va storto, le azzera
   */
  loadCurrentUser() {
    return this.http.get<User>(`${this.base}/users/me`).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }

  /**
   * Servizio che permette di modificare la password
   * @param currentPassword 
   * @param newPassword 
   */
  changePassword(currentPassword: string, newPassword: string) {
    return this.http
      .post<{ message: string }>(`${this.base}/auth/change-password`, { currentPassword, newPassword })
      .pipe(tap(() => this.currentUser.set(null)));
  } 

}