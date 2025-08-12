import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReportRequest, ReportResultDTO, ExportFormat, IncidentReportDataDTO, SLAReportDataDTO, ReportTemplate } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.reportApiUrl}/v1/reports`; // -> /api/v1/reports

  constructor(private http: HttpClient) {}

  generateReport(request: ReportRequest): Observable<ReportResultDTO> {
    return this.http.post<ReportResultDTO>(`${this.base}`, request);
  }

  generateIncidentReport(incidentId: number): Observable<ReportResultDTO> {
    const request: ReportRequest = { templateName: 'incident_report', format: ExportFormat.PDF, parameters: { incidentId } };
    return this.generateReport(request);
  }

  generateIncidentReportWithFormat(incidentId: number, format: ExportFormat): Observable<ReportResultDTO> {
    const request: ReportRequest = { templateName: 'incident_report', format, parameters: { incidentId } };
    return this.generateReport(request);
  }

  exportIncidentsForPrediction(): Observable<Blob> {
    return this.http.get(`${this.base}/incidents/csv`, { responseType: 'blob' });
  }

  generateSLAReport(incidentType?: string, timeRange?: string): Observable<ReportResultDTO> {
    const request: ReportRequest = { templateName: 'sla_report', format: ExportFormat.PDF, parameters: { incidentType, timeRange } };
    return this.generateReport(request);
  }

  generatePerformanceReport(period: string): Observable<ReportResultDTO> {
    const request: ReportRequest = { templateName: 'performance_report', format: ExportFormat.PDF, parameters: { period } };
    return this.generateReport(request);
  }

  generateAnalyticsReport(startDate: Date, endDate: Date): Observable<ReportResultDTO> {
    const request: ReportRequest = { templateName: 'analytics_report', format: ExportFormat.PDF, parameters: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } };
    return this.generateReport(request);
  }

  generateSummaryReport(): Observable<ReportResultDTO> {
    const request: ReportRequest = { templateName: 'summary_report', format: ExportFormat.PDF, parameters: {} };
    return this.generateReport(request);
  }

  getReportTemplates(): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.base}/templates`);
  }

  getReportTemplate(templateName: string): Observable<ReportTemplate> {
    return this.http.get<ReportTemplate>(`${this.base}/templates/${encodeURIComponent(templateName)}`);
  }

  createReportTemplate(template: ReportTemplate): Observable<ReportTemplate> {
    return this.http.post<ReportTemplate>(`${this.base}/templates`, template);
  }

  updateReportTemplate(templateId: number, template: ReportTemplate): Observable<ReportTemplate> {
    return this.http.put<ReportTemplate>(`${this.base}/templates/${templateId}`, template);
  }

  deleteReportTemplate(templateId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/templates/${templateId}`);
  }

  searchReportTemplates(query: string): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.base}/templates/search`, { params: { q: query } as any });
  }

  getReportHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/history`);
  }

  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.base}/${reportId}/download`, { responseType: 'blob' });
  }

  getReportStatus(reportId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${reportId}/status`);
  }

  cancelReport(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${reportId}`);
  }

  // Data sources for reports (fix: add /v1)
  getIncidentData(incidentId: number): Observable<IncidentReportDataDTO> {
    return this.http.get<IncidentReportDataDTO>(`${environment.incidentApiUrl}/v1/incidents/${incidentId}/report-data`);
  }

  getSLAData(incidentType?: string, timeRange?: string): Observable<SLAReportDataDTO[]> {
    const params: any = {};
    if (incidentType) params.incidentType = incidentType;
    if (timeRange)   params.timeRange   = timeRange;
    return this.http.get<SLAReportDataDTO[]>(`${environment.slaApiUrl}/v1/slas/report-data`, { params });
  }

  // Utilities for blobs
  downloadBlobAsFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
    window.URL.revokeObjectURL(url);
  }

  openBlobInNewTab(blob: Blob, contentType: string): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank')?.document && (/* tab opened */ 0);
  }

  generateAndDownloadReport(request: ReportRequest, fileName?: string): Observable<void> {
    return new Observable(observer => {
      this.generateReport(request).subscribe({
        next: (result) => {
          const blob = new Blob([result.content], { type: result.contentType });
          this.downloadBlobAsFile(blob, fileName || result.fileName);
          observer.next(); observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  generateAndOpenReport(request: ReportRequest): Observable<void> {
    return new Observable(observer => {
      this.generateReport(request).subscribe({
        next: (result) => {
          const blob = new Blob([result.content], { type: result.contentType });
          this.openBlobInNewTab(blob, result.contentType);
          observer.next(); observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}