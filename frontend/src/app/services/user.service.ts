import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User, AssignableUser } from "../models/user.model";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root'})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  /**
   * Servizio che elenca tutti gli utenti
   * @returns 
   */
  list() {
    return this.http.get<User[]>(this.base);
  }

  /**
   * Servizio che elenca tutti gli utenti che possono essere assegnati a una issue
   * @returns 
   */
  listAssignable() {
    return this.http.get<AssignableUser[]>(`${this.base}/assignable`);
  }

  /**
   * Servizio che permette di creare un nuovo utente
   * @param data 
   */
  create(data: { nome: string; cognome: string; password: string; role?: 'user' | 'viewer' | 'admin'}) {
    return this.http.post<User>(this.base, data);
  }
}