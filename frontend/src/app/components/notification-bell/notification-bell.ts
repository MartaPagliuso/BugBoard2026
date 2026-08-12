import { Component, inject, signal, HostListener, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { interval, startWith, switchMap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { Notification } from "../../models/notification.model";

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.html'
})
export class NotificationBell {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef);

  readonly unreadCount = this.notificationService.unreadCount;

  open = signal(false);
  notifications = signal<Notification[]>([]);
  loading = signal(false);
  total = signal(0);

  constructor() {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.notificationService.fetchUnreadCount()),
      takeUntilDestroyed(),
    ).subscribe();
  }

  toggle() {
    this.open.update((v) => !v);
    if (this.open())
      this.loadNotifications();
  }

  private loadNotifications() {
    this.loading.set(true);
    this.notificationService.list().subscribe({
      next: (res) => {
        this.notifications.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onNotificationClick(n: Notification) {
    if (!n.read) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        this.notifications.update((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x )));
        this.notificationService.unreadCount.update((c) => Math.max(0, c-1));
      });
    }

    this.open.set(false);
    if (n.issueId)
      this.router.navigate(['issues', n.issueId]);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
      this.notificationService.unreadCount.set(0);
    });
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff/60000);
    if (minutes < 1)
      return 'ora';

    if (minutes < 60)
      return `${minutes} min fa`;

    const hours = Math.floor(minutes/60);
    if (hours < 24)
      return `${hours === 1 ? 'ora' : 'ore'} fa`;

    const days = Math.floor(hours/24);
    if (days === 1)
      return 'ieri';

    if (days < 30)
      return `${days} giorni fa`;

    return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target))
      this.open.set(false);
  }
}