import { Component, inject } from "@angular/core";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}