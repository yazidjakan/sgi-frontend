import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SLADTO, SLAMetricDTO, SLAViolationDTO } from '../models/sla.model';

@Injectable({ providedIn: 'root' })
export class SLAService {
  private base = `${environment.slaApiUrl}/v1/slas`; // -> /api/v1/slas

  constructor(private http: HttpClient) {}

  // Create
  createSLA(slaDto: SLADTO): Observable<SLADTO> {
    return this.http.post<SLADTO>(`${this.base}`, slaDto);
  }

  // Read
  getSLAById(id: number): Observable<SLADTO> {
    return this.http.get<SLADTO>(`${this.base}/${id}`);
  }

  getSLAByType(incidentType: string): Observable<SLADTO> {
    return this.http.get<SLADTO>(`${this.base}/by-type/${encodeURIComponent(incidentType)}`);
  }

  getAllSLAs(): Observable<SLADTO[]> {
    return this.http.get<SLADTO[]>(`${this.base}`);
  }

  // Update
  updateSLA(id: number, slaDto: SLADTO): Observable<SLADTO> {
    return this.http.put<SLADTO>(`${this.base}/${id}`, slaDto);
  }

  // Delete
  deleteSLA(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Metrics & violations
  calculateMetrics(slaId: number): Observable<SLAMetricDTO> {
    return this.http.post<SLAMetricDTO>(`${this.base}/${slaId}/calculate-metrics`, {});
  }

  getViolations(): Observable<SLAViolationDTO[]> {
    return this.http.get<SLAViolationDTO[]>(`${this.base}/violations`);
  }

  getViolationsByType(incidentType: string): Observable<SLAViolationDTO[]> {
    const params = new HttpParams().set('type', incidentType);
    return this.http.get<SLAViolationDTO[]>(`${this.base}/violations`, { params });
  }

  getMetrics(slaId: number, startDate?: Date, endDate?: Date): Observable<SLAMetricDTO[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate)   params = params.set('endDate',   endDate.toISOString());
    return this.http.get<SLAMetricDTO[]>(`${this.base}/${slaId}/metrics`, { params });
  }

  getComplianceStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/compliance-stats`);
  }

  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${this.base}/dashboard-metrics`);
  }

  getPerformanceTrends(slaId: number, days = 30): Observable<any> {
    const params = new HttpParams().set('days', days);
    return this.http.get<any>(`${this.base}/${slaId}/trends`, { params });
  }

  getSLAAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/alerts`);
  }

  getSLARecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/recommendations`);
  }

  exportSLAReport(startDate: Date, endDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.base}/export`, { params, responseType: 'blob' });
  }

  getSLASummary(): Observable<any> {
    return this.http.get<any>(`${this.base}/summary`);
  }

  compareSLAs(slaIds: number[]): Observable<any> {
    const params = new HttpParams().set('ids', slaIds.join(','));
    return this.http.get<any>(`${this.base}/compare`, { params });
  }
}