import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Issue, IssueFilters, IssuePriority, IssueStatus, IssueType, PaginatedIssues } from "../models/issue.model";
import { Comment } from "../models/comment.model";

@Injectable({ providedIn: 'root' })
export class IssueService {
  private readonly http = inject(HttpClient);

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

    return this.http.get<PaginatedIssues>('/api/issues', { params });
  }

  /**
   * Servizio che mostra una determinata issue in base all'id
   * @param id 
   */
  getById(id: string) {
    return this.http.get<Issue>(`/api/issues/${id}`);
  }

  /**
   * Servizio che permette di creare una nuova issue
   * @param data 
   */
  create(data: { title: string; description: string; type: IssueType; priority?: IssuePriority }) {
    return this.http.post<Issue>('/api/issues', data);
  }

  /**
   * Servizio che permette di modificare lo stato di una issue
   * @param id 
   * @param status 
   */
  updateStatus(id: string, status: IssueStatus) {
    return this.http.patch<Issue>(`/api/issues/${id}/status`, { status });
  }

  /**
   * Servizio che assegna un utente a una issue
   * @param id 
   * @param assigneeId 
   * @returns 
   */
  assign(id: string, assigneeId: string) {
    return this.http.patch<Issue>(`/api/issues/${id}/assignee`, { assigneeId });
  }

  /**
   * Servizio che setta la data di scadenza a una issue
   * @param id 
   * @param dueDate 
   * @returns 
   */
  setDueDate(id: string, dueDate: string | null) {
    return this.http.patch<Issue>(`/api/issues/${id}/due-date`, { dueDate });
  }

  /**
   * Servizio che elimina una issue
   * @param id 
   * @returns 
   */
  remove(id: string) {
    return this.http.delete<void>(`api/issues/${id}`);
  }

  /**
   * Servizio che elenca i commenti di una issue
   * @param issueId 
   */
  listComments(issueId: string) {
    return this.http.get<Comment[]>(`api/issues/${issueId}/comments`);
  }

  /**
   * Servizio che permette di inserire un nuovo commento alla issue
   * @param issueId 
   * @param body 
   * @returns 
   */
  addComment(issueId: string, body: string) {
    return this.http.post<Comment>(`/api/issues/${issueId}/comments`, { body });
  }

  /**
   * Servizio che permette di inserire un'immagine in una issue
   * @param issueId 
   * @param file 
   */
  uploadImage(issueId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<Issue>(`/api/issues/${issueId}/image`, formData);
  }
}