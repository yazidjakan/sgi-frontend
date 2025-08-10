import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  ReportRequest, 
  ReportResultDTO, 
  ExportFormat,
  IncidentReportDataDTO,
  SLAReportDataDTO,
  ReportTemplate
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.reportApiUrl || `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  // Generate report with custom request
  generateReport(request: ReportRequest): Observable<ReportResultDTO> {
    return this.http.post<ReportResultDTO>(`${this.apiUrl}/v1/reports`, request);
  }

  // Generate incident report
  generateIncidentReport(incidentId: number): Observable<ReportResultDTO> {
    const request: ReportRequest = {
      templateName: 'incident_report',
      format: ExportFormat.PDF,
      parameters: { incidentId: incidentId }
    };
    return this.generateReport(request);
  }

  // Generate incident report with custom format
  generateIncidentReportWithFormat(incidentId: number, format: ExportFormat): Observable<ReportResultDTO> {
    const request: ReportRequest = {
      templateName: 'incident_report',
      format: format,
      parameters: { incidentId: incidentId }
    };
    return this.generateReport(request);
  }

  // Export incidents for AI training (CSV)
  exportIncidentsForPrediction(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/v1/reports/incidents/csv`, {
      responseType: 'blob'
    });
  }

  // Generate SLA report
  generateSLAReport(incidentType?: string, timeRange?: string): Observable<ReportResultDTO> {
    const request: ReportRequest = {
      templateName: 'sla_report',
      format: ExportFormat.PDF,
      parameters: {
        incidentType: incidentType,
        timeRange: timeRange
      }
    };
    return this.generateReport(request);
  }

  // Generate performance report
  generatePerformanceReport(period: string): Observable<ReportResultDTO> {
    const request: ReportRequest = {
      templateName: 'performance_report',
      format: ExportFormat.PDF,
      parameters: {
        period: period
      }
    };
    return this.generateReport(request);
  }

  // Generate analytics report
  generateAnalyticsReport(startDate: Date, endDate: Date): Observable<ReportResultDTO> {
    const request: ReportRequest = {
      templateName: 'analytics_report',
      format: ExportFormat.PDF,
      parameters: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    };
    return this.generateReport(request);
  }

  // Generate summary report
  generateSummaryReport(): Observable<ReportResultDTO> {
    const request: ReportRequest = {
      templateName: 'summary_report',
      format: ExportFormat.PDF,
      parameters: {}
    };
    return this.generateReport(request);
  }

  // Get available report templates
  getReportTemplates(): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.apiUrl}/v1/reports/templates`);
  }

  // Get report template by name
  getReportTemplate(templateName: string): Observable<ReportTemplate> {
    return this.http.get<ReportTemplate>(`${this.apiUrl}/v1/reports/templates/${templateName}`);
  }

  // Create new report template
  createReportTemplate(template: ReportTemplate): Observable<ReportTemplate> {
    return this.http.post<ReportTemplate>(`${this.apiUrl}/v1/reports/templates`, template);
  }

  // Update report template
  updateReportTemplate(templateId: number, template: ReportTemplate): Observable<ReportTemplate> {
    return this.http.put<ReportTemplate>(`${this.apiUrl}/v1/reports/templates/${templateId}`, template);
  }

  // Delete report template
  deleteReportTemplate(templateId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/reports/templates/${templateId}`);
  }

  // Search report templates
  searchReportTemplates(query: string): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.apiUrl}/v1/reports/templates/search?q=${query}`);
  }

  // Get report history
  getReportHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/v1/reports/history`);
  }

  // Download report file
  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/v1/reports/${reportId}/download`, {
      responseType: 'blob'
    });
  }

  // Get report status
  getReportStatus(reportId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/v1/reports/${reportId}/status`);
  }

  // Cancel report generation
  cancelReport(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/reports/${reportId}`);
  }

  // Helper method to download blob as file
  downloadBlobAsFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Helper method to open blob in new tab
  openBlobInNewTab(blob: Blob, contentType: string): void {
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.document.title = 'Rapport généré';
    }
  }

  // Generate report and download
  generateAndDownloadReport(request: ReportRequest, fileName?: string): Observable<void> {
    return new Observable(observer => {
      this.generateReport(request).subscribe({
        next: (result) => {
          const blob = new Blob([result.content], { type: result.contentType });
          const downloadFileName = fileName || result.fileName;
          this.downloadBlobAsFile(blob, downloadFileName);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Generate report and open in new tab
  generateAndOpenReport(request: ReportRequest): Observable<void> {
    return new Observable(observer => {
      this.generateReport(request).subscribe({
        next: (result) => {
          const blob = new Blob([result.content], { type: result.contentType });
          this.openBlobInNewTab(blob, result.contentType);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Get incident data for report
  getIncidentData(incidentId: number): Observable<IncidentReportDataDTO> {
    return this.http.get<IncidentReportDataDTO>(`${environment.incidentApiUrl}/incidents/${incidentId}/report-data`);
  }

  // Get SLA data for report
  getSLAData(incidentType?: string, timeRange?: string): Observable<SLAReportDataDTO[]> {
    let url = `${environment.slaApiUrl}/slas/report-data`;
    const params = new URLSearchParams();
    if (incidentType) params.append('incidentType', incidentType);
    if (timeRange) params.append('timeRange', timeRange);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    return this.http.get<SLAReportDataDTO[]>(url);
  }
}
