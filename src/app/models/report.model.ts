export interface IncidentReportDataDTO {
  id?: number;
  title: string;
  description?: string;
  incidentType: string;
  priority: string;
  creationDate?: Date;
  resolutionDate?: Date;
  status: string;
  reporterName?: string;
  assignedTechnicianName?: string;
  comments?: CommentDTO[];
  attachments?: AttachmentDTO[];
  slaData?: SLADataDTO;
}

export interface CommentDTO {
  author: string;
  content: string;
  creationDate?: Date;
}

export interface AttachmentDTO {
  fileName: string;
  fileType: string;
}

export interface SLADataDTO {
  responseTimeViolated: boolean;
  resolutionTimeViolated: boolean;
  responseTime?: string; // Duration as string
  resolutionTime?: string; // Duration as string
  allowedResponseTime?: string; // Duration as string
  allowedResolutionTime?: string; // Duration as string
}

export interface ReportRequest {
  templateName: string;
  parameters: { [key: string]: any };
  format: ExportFormat;
}

export enum ExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  HTML = 'HTML'
}

export interface ReportResultDTO {
  content: Uint8Array;
  fileName: string;
  contentType: string;
}

export interface SLAReportDataDTO {
  incidentType: string;
  periodStart?: Date;
  periodEnd?: Date;
  complianceRate: number;
  totalIncidents: number;
  incidentsWithinSLA: number;
  averageResponseTime?: string; // Duration as string
  averageResolutionTime?: string; // Duration as string
  violations?: ViolationSummaryDTO[];
}

export interface ViolationSummaryDTO {
  violationType: 'RESPONSE_TIME' | 'RESOLUTION_TIME';
  count: number;
  averageExceededBy?: string; // Duration as string
}

export interface ReportTemplate {
  id?: number;
  templateName: string;
  description: string;
  filePath: string;
}

// Report types for different categories
export enum ReportType {
  INCIDENT_REPORT = 'INCIDENT_REPORT',
  SLA_REPORT = 'SLA_REPORT',
  PERFORMANCE_REPORT = 'PERFORMANCE_REPORT',
  ANALYTICS_REPORT = 'ANALYTICS_REPORT',
  SUMMARY_REPORT = 'SUMMARY_REPORT'
}

// Report periods
export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

// Report status
export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Predefined report templates
export const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  'incident_report': {
    templateName: 'incident_report',
    description: 'Rapport détaillé d\'un incident',
    filePath: '/templates/incident_report.jrxml'
  },
  'sla_report': {
    templateName: 'sla_report',
    description: 'Rapport de conformité SLA',
    filePath: '/templates/sla_report.jrxml'
  },
  'performance_report': {
    templateName: 'performance_report',
    description: 'Rapport de performance des équipes',
    filePath: '/templates/performance_report.jrxml'
  },
  'analytics_report': {
    templateName: 'analytics_report',
    description: 'Rapport d\'analyse des incidents',
    filePath: '/templates/analytics_report.jrxml'
  },
  'summary_report': {
    templateName: 'summary_report',
    description: 'Rapport de synthèse',
    filePath: '/templates/summary_report.jrxml'
  }
};

// Helper functions for reports
export const getFormatIcon = (format: ExportFormat): string => {
  switch (format) {
    case ExportFormat.PDF:
      return 'picture_as_pdf';
    case ExportFormat.EXCEL:
      return 'table_chart';
    case ExportFormat.HTML:
      return 'html';
    default:
      return 'description';
  }
};

export const getFormatColor = (format: ExportFormat): string => {
  switch (format) {
    case ExportFormat.PDF:
      return '#f44336'; // Red
    case ExportFormat.EXCEL:
      return '#4caf50'; // Green
    case ExportFormat.HTML:
      return '#2196f3'; // Blue
    default:
      return '#9e9e9e'; // Grey
  }
};

export const getFormatLabel = (format: ExportFormat): string => {
  switch (format) {
    case ExportFormat.PDF:
      return 'PDF';
    case ExportFormat.EXCEL:
      return 'Excel';
    case ExportFormat.HTML:
      return 'HTML';
    default:
      return 'Document';
  }
};

export const getReportTypeIcon = (type: ReportType): string => {
  switch (type) {
    case ReportType.INCIDENT_REPORT:
      return 'bug_report';
    case ReportType.SLA_REPORT:
      return 'schedule';
    case ReportType.PERFORMANCE_REPORT:
      return 'trending_up';
    case ReportType.ANALYTICS_REPORT:
      return 'analytics';
    case ReportType.SUMMARY_REPORT:
      return 'summarize';
    default:
      return 'assessment';
  }
};

export const getReportTypeColor = (type: ReportType): string => {
  switch (type) {
    case ReportType.INCIDENT_REPORT:
      return '#ff9800'; // Orange
    case ReportType.SLA_REPORT:
      return '#2196f3'; // Blue
    case ReportType.PERFORMANCE_REPORT:
      return '#4caf50'; // Green
    case ReportType.ANALYTICS_REPORT:
      return '#9c27b0'; // Purple
    case ReportType.SUMMARY_REPORT:
      return '#607d8b'; // Blue grey
    default:
      return '#9e9e9e'; // Grey
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (duration: string): string => {
  // Convert ISO 8601 duration to human readable format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
};
