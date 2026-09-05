import { Injectable, signal } from "@angular/core";

export interface Toast {
  id: number; 
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  /**
   * Metodo per messaggio di successo
   * @param message 
   */
  success(message: string) {
    this.show(message, 'success');
  }

  /**
   * Metodo per messaggio di errore
   * @param message 
   */
  error(message: string) {
    this.show(message, 'error');
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private show(message: string, type: 'success' | 'error') {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}