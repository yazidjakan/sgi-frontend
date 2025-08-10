import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  SLADTO, 
  SLAMetricDTO, 
  SLAViolationDTO, 
  IncidentDTO 
} from '../models/sla.model';

@Injectable({
  providedIn: 'root'
})
export class SLAService {
  private apiUrl = environment.slaApiUrl || `${environment.apiUrl}/slas`;

  constructor(private http: HttpClient) {}

  // Create new SLA
  createSLA(slaDto: SLADTO): Observable<SLADTO> {
    return this.http.post<SLADTO>(`${this.apiUrl}/api/slas`, slaDto);
  }

  // Get SLA by ID
  getSLAById(id: number): Observable<SLADTO> {
    return this.http.get<SLADTO>(`${this.apiUrl}/api/slas/${id}`);
  }

  // Get SLA by incident type
  getSLAByType(incidentType: string): Observable<SLADTO> {
    return this.http.get<SLADTO>(`${this.apiUrl}/api/slas/by-type/${incidentType}`);
  }

  // Calculate SLA metrics
  calculateMetrics(slaId: number): Observable<SLAMetricDTO> {
    return this.http.post<SLAMetricDTO>(`${this.apiUrl}/api/slas/${slaId}/calculate-metrics`, {});
  }

  // Get SLA violations
  getViolations(): Observable<SLAViolationDTO[]> {
    return this.http.get<SLAViolationDTO[]>(`${this.apiUrl}/api/slas/violations`);
  }

  // Get SLA metrics with date range
  getMetrics(slaId: number, startDate?: Date, endDate?: Date): Observable<SLAMetricDTO[]> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<SLAMetricDTO[]>(`${this.apiUrl}/api/slas/${slaId}/metrics`, { params });
  }

  // Get all SLAs
  getAllSLAs(): Observable<SLADTO[]> {
    return this.http.get<SLADTO[]>(`${this.apiUrl}/api/slas`);
  }

  // Update SLA
  updateSLA(id: number, slaDto: SLADTO): Observable<SLADTO> {
    return this.http.put<SLADTO>(`${this.apiUrl}/api/slas/${id}`, slaDto);
  }

  // Delete SLA
  deleteSLA(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/slas/${id}`);
  }

  // Get SLA compliance statistics
  getComplianceStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/slas/compliance-stats`);
  }

  // Get SLA violations by type
  getViolationsByType(incidentType: string): Observable<SLAViolationDTO[]> {
    return this.http.get<SLAViolationDTO[]>(`${this.apiUrl}/api/slas/violations?type=${incidentType}`);
  }

  // Get SLA metrics for dashboard
  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/slas/dashboard-metrics`);
  }

  // Get SLA performance trends
  getPerformanceTrends(slaId: number, days: number = 30): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/slas/${slaId}/trends?days=${days}`);
  }

  // Get SLA alerts
  getSLAAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/slas/alerts`);
  }

  // Get SLA recommendations
  getSLARecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/slas/recommendations`);
  }

  // Export SLA report
  exportSLAReport(startDate: Date, endDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    return this.http.get(`${this.apiUrl}/api/slas/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Get SLA summary
  getSLASummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/slas/summary`);
  }

  // Get SLA comparison
  compareSLAs(slaIds: number[]): Observable<any> {
    const params = new HttpParams().set('ids', slaIds.join(','));
    return this.http.get<any>(`${this.apiUrl}/api/slas/compare`, { params });
  }
}
