export interface SLADTO {
  id?: number;
  incidentType: string;
  maxResponseTime: string; // Duration as string
  maxResolutionTime: string; // Duration as string
}

export interface SLAMetricDTO {
  id?: number;
  calculationDate?: Date;
  complianceRate: number;
  totalIncidents: number;
  incidentsWithinSLA: number;
  slaId: number;
}

export interface SLAViolationDTO {
  incidentId: number;
  incidentType: string;
  violationTime?: Date;
  violationType: 'RESPONSE' | 'RESOLUTION';
  exceededBy: string; // Duration as string
}

export interface IncidentDTO {
  id?: number;
  title: string;
  description?: string;
  incidentType: string;
  priority: string;
  creationDate?: Date;
  responseDate?: Date;
  resolutionDate?: Date;
  status: string;
  reporterId: number;
  assignedTechnicianId?: number;
}

export interface SLA {
  id?: number;
  incidentType: string;
  maxResponseTime: string;
  maxResolutionTime: string;
  metrics?: SLAMetricDTO[];
}

export interface SLAMetric {
  id?: number;
  calculationDate?: Date;
  complianceRate: number;
  totalIncidents: number;
  incidentsWithinSLA: number;
  sla?: SLA;
}

// SLA Violation types
export enum ViolationType {
  RESPONSE = 'RESPONSE',
  RESOLUTION = 'RESOLUTION'
}

// SLA Compliance levels
export enum ComplianceLevel {
  EXCELLENT = 'EXCELLENT', // 90-100%
  GOOD = 'GOOD',           // 75-89%
  AVERAGE = 'AVERAGE',     // 60-74%
  POOR = 'POOR',          // <60%
  CRITICAL = 'CRITICAL'    // <50%
}

// Helper functions for SLA calculations
export const getComplianceLevel = (rate: number): ComplianceLevel => {
  if (rate >= 90) return ComplianceLevel.EXCELLENT;
  if (rate >= 75) return ComplianceLevel.GOOD;
  if (rate >= 60) return ComplianceLevel.AVERAGE;
  if (rate >= 50) return ComplianceLevel.POOR;
  return ComplianceLevel.CRITICAL;
};

export const getComplianceColor = (rate: number): string => {
  if (rate >= 90) return '#4caf50'; // Green
  if (rate >= 75) return '#8bc34a'; // Light green
  if (rate >= 60) return '#ffc107'; // Yellow
  if (rate >= 50) return '#ff9800'; // Orange
  return '#f44336'; // Red
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

export const parseDuration = (duration: string): number => {
  // Convert ISO 8601 duration to minutes
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 60 + minutes + seconds / 60;
};
