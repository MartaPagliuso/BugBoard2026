import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Issue, IssueFilters, IssuePriority, IssueStatus, IssueType, PaginatedIssues } from "../models/issue.model";
import { Comment } from "../models/comment.model";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IssueService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/issues`;

  /**
   * Servizio che elenca tutte le issue presenti
   * @param filters 
   */
  list(filters: IssueFilters = {}, page = 1, limit = 20) {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (filters.q) params = params.set('q', filters.q);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.priority) params = params.set('priority', filters.priority);

    return this.http.get<PaginatedIssues>(this.base, { params });
  }

  /**
   * Servizio che mostra una determinata issue in base all'id
   * @param id 
   */
  getById(id: string) {
    return this.http.get<Issue>(`${this.base}/${id}`);
  }

  /**
   * Servizio che permette di creare una nuova issue
   * @param data 
   */
  create(data: { title: string; description: string; type: IssueType; priority?: IssuePriority }) {
    return this.http.post<Issue>(this.base, data);
  }

  /**
   * Servizio che permette di modificare lo stato di una issue
   * @param id 
   * @param status 
   */
  updateStatus(id: string, status: IssueStatus) {
    return this.http.patch<Issue>(`${this.base}/${id}/status`, { status });
  }

  /**
   * Servizio che assegna un utente a una issue
   * @param id 
   * @param assigneeId 
   * @returns 
   */
  assign(id: string, assigneeId: string) {
    return this.http.patch<Issue>(`${this.base}/${id}/assignee`, { assigneeId });
  }

  /**
   * Servizio che setta la data di scadenza a una issue
   * @param id 
   * @param dueDate 
   * @returns 
   */
  setDueDate(id: string, dueDate: string | null) {
    return this.http.patch<Issue>(`${this.base}/${id}/due-date`, { dueDate });
  }

  /**
   * Servizio che elimina una issue
   * @param id 
   * @returns 
   */
  remove(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /**
   * Servizio che elenca i commenti di una issue
   * @param issueId 
   */
  listComments(issueId: string) {
    return this.http.get<Comment[]>(`${this.base}/${issueId}/comments`);
  }

  /**
   * Servizio che permette di inserire un nuovo commento alla issue
   * @param issueId 
   * @param body 
   * @returns 
   */
  addComment(issueId: string, body: string) {
    return this.http.post<Comment>(`${this.base}/${issueId}/comments`, { body });
  }

  /**
   * Servizio che permette di inserire un'immagine in una issue
   * @param issueId 
   * @param file 
   */
  uploadImage(issueId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<Issue>(`${this.base}/${issueId}/image`, formData);
  }

  /**
   * Servizio che permette di modificare una issue
   * @param id 
   * @param data 
   * @returns 
   */
  update(id: string, data: { title?: string; description?: string; type?: IssueType; priority?: IssuePriority | null }) {
    return this.http.patch<Issue>(`${this.base}/${id}`, data);
  }
}