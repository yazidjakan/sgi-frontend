import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Incident, Commentaire, Attachment, ActionHistory, StatutIncident, NiveauPriorite } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private base = `${environment.apiUrl}/v1/incidents`; // -> /api/v1/incidents

  constructor(private http: HttpClient) {}

  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.base);
  }

  getIncident(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.base}/${id}`);
  }

  createIncident(incident: Incident): Observable<Incident> {
    return this.http.post<Incident>(this.base, incident);
  }

  updateIncident(id: number, incident: Incident): Observable<Incident> {
    return this.http.put<Incident>(`${this.base}/${id}`, incident);
  }

  deleteIncident(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updateStatus(id: number, status: StatutIncident): Observable<Incident> {
    return this.http.put<Incident>(`${this.base}/${id}/status`, { status });
  }

  getIncidentsByStatus(status: StatutIncident): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}`, { params: { status } as any });
  }

  getIncidentsByPriority(priority: NiveauPriorite): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}`, { params: { priority } as any });
  }

  getIncidentsByTechnician(technicianId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}`, { params: { assignedTechnicianId: technicianId } as any });
  }

  getIncidentsByReporter(reporterId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}`, { params: { reporterId } as any });
  }

  addComment(incidentId: number, content: string): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.base}/${incidentId}/comments`, { content });
  }

  getComments(incidentId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.base}/${incidentId}/comments`);
  }

  addAttachment(incidentId: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.base}/${incidentId}/attachments`, formData);
  }

  getAttachments(incidentId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.base}/${incidentId}/attachments`);
  }

  getActionHistory(incidentId: number): Observable<ActionHistory[]> {
    return this.http.get<ActionHistory[]>(`${this.base}/${incidentId}/history`);
  }

  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.base}/export-csv`, { responseType: 'blob' });
  }

  getResolvedForAI(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}/resolved-for-ai`);
  }

  getIncidentStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/stats`);
  }

  getOverdueIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}/overdue`);
  }

  assignIncident(incidentId: number, technicianId: number): Observable<Incident> {
    return this.http.put<Incident>(`${this.base}/${incidentId}/assign`, { technicianId });
  }

  getIncidentsByType(incidentType: string): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}`, { params: { incidentType } as any });
  }

  searchIncidents(query: string): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}/search`, { params: { q: query } as any });
  }
}