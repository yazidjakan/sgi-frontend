import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Incident, 
  Commentaire, 
  Attachment, 
  ActionHistory, 
  StatutIncident,
  NiveauPriorite 
} from '../models/incident.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = environment.apiUrl;
  private incidentUrl = `${this.apiUrl}/v1/incidents`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all incidents
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.incidentUrl);
  }

  // Get incident by ID
  getIncident(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.incidentUrl}/${id}`);
  }

  // Create new incident
  createIncident(incident: Incident): Observable<Incident> {
    const headers = new HttpHeaders().set('X-User-ID', this.authService.currentUserValue?.id?.toString() || '');
    return this.http.post<Incident>(this.incidentUrl, incident, { headers });
  }

  // Update incident
  updateIncident(id: number, incident: Incident): Observable<Incident> {
    return this.http.put<Incident>(`${this.incidentUrl}/${id}`, incident);
  }

  // Delete incident
  deleteIncident(id: number): Observable<void> {
    return this.http.delete<void>(`${this.incidentUrl}/${id}`);
  }

  // Update incident status
  updateStatus(id: number, status: StatutIncident): Observable<Incident> {
    return this.http.put<Incident>(`${this.incidentUrl}/${id}/status?status=${status}`, {});
  }

  // Get incidents by status
  getIncidentsByStatus(status: StatutIncident): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}?status=${status}`);
  }

  // Get incidents by priority
  getIncidentsByPriority(priority: NiveauPriorite): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}?priority=${priority}`);
  }

  // Get incidents by technician
  getIncidentsByTechnician(technicianId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}?assignedTechnicianId=${technicianId}`);
  }

  // Get incidents by reporter
  getIncidentsByReporter(reporterId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}?reporterId=${reporterId}`);
  }

  // Add comment to incident
  addComment(incidentId: number, content: string): Observable<Commentaire> {
    const headers = new HttpHeaders().set('X-User-ID', this.authService.currentUserValue?.id?.toString() || '');
    return this.http.post<Commentaire>(`${this.incidentUrl}/${incidentId}/comments?content=${encodeURIComponent(content)}`, {}, { headers });
  }

  // Get comments for incident
  getComments(incidentId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.incidentUrl}/${incidentId}/comments`);
  }

  // Add attachment to incident
  addAttachment(incidentId: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = new HttpHeaders().set('X-User-ID', this.authService.currentUserValue?.id?.toString() || '');
    return this.http.post<Attachment>(`${this.incidentUrl}/${incidentId}/attachments`, formData, { headers });
  }

  // Get attachments for incident
  getAttachments(incidentId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.incidentUrl}/${incidentId}/attachments`);
  }

  // Get action history for incident
  getActionHistory(incidentId: number): Observable<ActionHistory[]> {
    return this.http.get<ActionHistory[]>(`${this.incidentUrl}/${incidentId}/history`);
  }

  // Export incidents to CSV
  exportCsv(): Observable<string> {
    return this.http.get<string>(`${this.incidentUrl}/export-csv`);
  }

  // Download CSV file
  downloadCsv(): Observable<Blob> {
    return this.http.get(`${this.incidentUrl}/download-csv`, { responseType: 'blob' });
  }

  // Get resolved incidents for AI
  getResolvedForAI(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}/api/incidents/resolved-for-ai`);
  }

  // Get incident statistics
  getIncidentStats(): Observable<any> {
    return this.http.get<any>(`${this.incidentUrl}/stats`);
  }

  // Get overdue incidents
  getOverdueIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}/overdue`);
  }

  // Assign incident to technician
  assignIncident(incidentId: number, technicianId: number): Observable<Incident> {
    return this.http.put<Incident>(`${this.incidentUrl}/${incidentId}/assign`, { technicianId });
  }

  // Get incidents by type
  getIncidentsByType(incidentType: string): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}?incidentType=${incidentType}`);
  }

  // Search incidents
  searchIncidents(query: string): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.incidentUrl}/search?q=${encodeURIComponent(query)}`);
  }
}
