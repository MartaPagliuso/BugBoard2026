import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap, catchError, of } from "rxjs";
import { User } from "../models/user.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<User | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isViewer = computed(() => this.currentUser()?.role === 'viewer');

  /**
   * Servizio che permette di effettuare il login
   * @param email 
   * @param password 
   * @returns 
   */
  login(email: string, password: string) {
    return this.http
      .post<{ user: User }>('/api/auth/login', { email, password })
      .pipe(tap((res) => this.currentUser.set(res.user)));
  }

  /**
   * Servizio che permette di effettuare il logout
   */
  logout() {
    return this.http
      .post('/api/auth/logout', {})
      .pipe(tap(() => this.currentUser.set(null)));
  }

  /**
   * Servizio che scarica le informazioni dell'utente
   * Se qualcosa va storto, le azzera
   */
  loadCurrentUser() {
    return this.http.get<User>('api/users/me').pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }

}