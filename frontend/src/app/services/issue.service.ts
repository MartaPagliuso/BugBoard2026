import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Issue, IssueFilters } from "../models/issue.model";

@Injectable({ providedIn: 'root' })
export class IssueService {
  private readonly http = inject(HttpClient);

  /**
   * Servizio che elenca tutte le issue presenti
   * @param filters 
   */
  list(filters: IssueFilters = {}) {
    let params = new HttpParams();

    if (filters.q) params = params.set('q', filters.q);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.priority) params = params.set('priority', filters.priority);

    return this.http.get<Issue[]>('/api/issues', { params });
  }

  /**
   * Servizio che mostra una determinata issue in base all'id
   * @param id 
   */
  getById(id: string) {
    return this.http.get<Issue>(`/api/issues/${id}`);
  }
}