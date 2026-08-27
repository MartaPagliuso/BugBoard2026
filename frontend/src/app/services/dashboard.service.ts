import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DashboardStats } from "../models/dashboard.mode.";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats() {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard`);
  }
}