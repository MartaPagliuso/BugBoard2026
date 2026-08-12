import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { Notification, NotificationList } from "../models/notification.model";

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  readonly unreadCount = signal(0);

  /**
   * Servizio che mostra l'elenco di tutte le notifiche
   * @returns 
   */
  list() {
    return this.http.get<NotificationList>('/api/notification');
  }

  /**
   * Servizio che restituisce il numero di notifiche non lette
   * @returns 
   */
  fetchUnreadCount() {
    return this.http
      .get<{ count: number }>('/api/notification/unread-count')
      .pipe(tap((res) => this.unreadCount.set(res.count)));
  }

  /**
   * Servizio che marca una notifica come letta
   * @param id 
   * @returns 
   */
  markAsRead(id: string) {
    return this.http.patch<Notification>(`/api/notification/${id}/read`, {});
  }

  /**
   * Servizio che marca tutte le notifiche come lette
   */
  markAllAsRead() {
    return this.http.patch('/api/notification/read-all', {});
  }
}