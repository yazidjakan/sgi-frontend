// src/app/services/sla.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// sla.model.ts
export interface SLAMetrics {
  complianceRate: number;
  overdueTickets: number;
  totalTickets: number;
  averageResolutionTime: number;
}

export interface HighRiskIncident {
  id: number;
  title: string;
  slaRiskScore: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
@Injectable({
  providedIn: 'root'
})
export class SlaService {
  private apiUrl = 'http://localhost:8079/api/v1/sla'; // Adaptez l'URL

  constructor(private http: HttpClient) {}

  getSLAMetrics(): Observable<SLAMetrics> {
    return this.http.get<SLAMetrics>(`${this.apiUrl}/metrics`);
  }

  getHighRiskIncidents(): Observable<HighRiskIncident[]> {
    return this.http.get<HighRiskIncident[]>(`${this.apiUrl}/high-risk`);
  }
}
