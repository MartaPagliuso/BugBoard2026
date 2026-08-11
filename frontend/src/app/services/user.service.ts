import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User, AssignableUser } from "../models/user.model";

@Injectable({ providedIn: 'root'})
export class UserService {
  private readonly http = inject(HttpClient);

  /**
   * Servizio che elenca tutti gli utenti
   * @returns 
   */
  list() {
    return this.http.get<User[]>('/api/users');
  }

  /**
   * Servizio che elenca tutti gli utenti che possono essere assegnati a una issue
   * @returns 
   */
  listAssignable() {
    return this.http.get<AssignableUser[]>('/api/users/assignable');
  }
}