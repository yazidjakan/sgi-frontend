import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Incident {
  id: number;
  title: string;
  description: string;
  status: StatutIncident;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
  updatedAt: Date;
  reporterId: number;
  assigneeId?: number;
}

export type StatutIncident = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IncidentCreate {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface IncidentUpdate {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Commentaire {
  id: number;
  content: string;
  createdAt: Date;
  authorId: number;
}

export interface Attachment {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  uploadedAt: Date;
  uploaderId: number;
}

export interface ActionHistory {
  id: number;
  actionType: string;
  description: string;
  performedAt: Date;
  performerId: number;
}
@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = 'http://localhost:8077/api/v1/incidents';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-User-ID': this.getCurrentUserId()?.toString() || ''
    });
  }

  private getCurrentUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return user?.id || null;
  }

  // Opérations de base
  getAllIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createIncidentWithAttachments(formData: FormData): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, formData, {
      headers: this.getHeaders()
    });
  }
  getIncidentById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createIncident(incident: IncidentCreate): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident, { headers: this.getHeaders() });
  }

  updateIncident(id: number, incident: IncidentUpdate): Observable<Incident> {
    return this.http.put<Incident>(`${this.apiUrl}/${id}`, incident, { headers: this.getHeaders() });
  }
  assignIncident(incidentId: number, assigneeId: number): Observable<Incident> {
    return this.http.put<Incident>(
      `${this.apiUrl}/${incidentId}/assign`,
      { assigneeId },
      { headers: this.getHeaders() }
    );
  }

  deleteIncident(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Gestion des statuts
  updateStatus(id: number, status: StatutIncident): Observable<Incident> {
    return this.http.put<Incident>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Commentaires
  addComment(id: number, content: string): Observable<Commentaire> {
    return this.http.post<Commentaire>(
      `${this.apiUrl}/${id}/comments`,
      { content },
      { headers: this.getHeaders() }
    );
  }

  getComments(id: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/${id}/comments`, { headers: this.getHeaders() });
  }

  // Pièces jointes
  addAttachment(id: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(
      `${this.apiUrl}/${id}/attachments`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  getAttachments(id: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/${id}/attachments`, { headers: this.getHeaders() });
  }

  // Historique
  getActionHistory(id: number): Observable<ActionHistory[]> {
    return this.http.get<ActionHistory[]>(`${this.apiUrl}/${id}/history`, { headers: this.getHeaders() });
  }

  // Export/Import
  exportCsv(): Observable<string> {
    return this.http.get(`${this.apiUrl}/export-csv`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  downloadCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-csv`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Pour l'IA
  getAllResolvedForAI(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/api/incidents/resolved-for-ai`, { headers: this.getHeaders() });
  }
}
