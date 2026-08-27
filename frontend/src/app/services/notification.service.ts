import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { Notification, NotificationList } from "../models/notification.model";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/notifications`;

  readonly unreadCount = signal(0);

  /**
   * Servizio che mostra l'elenco di tutte le notifiche
   * @returns 
   */
  list() {
    return this.http.get<NotificationList>(this.base);
  }

  /**
   * Servizio che restituisce il numero di notifiche non lette
   * @returns 
   */
  fetchUnreadCount() {
    return this.http
      .get<{ count: number }>(`${this.base}/unread-count`)
      .pipe(tap((res) => this.unreadCount.set(res.count)));
  }

  /**
   * Servizio che marca una notifica come letta
   * @param id 
   * @returns 
   */
  markAsRead(id: string) {
    return this.http.patch<Notification>(`${this.base}/${id}/read`, {});
  }

  /**
   * Servizio che marca tutte le notifiche come lette
   */
  markAllAsRead() {
    return this.http.patch(`${this.base}/read-all`, {});
  }
}