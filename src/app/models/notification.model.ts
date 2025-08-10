export interface NotificationDTO {
  id?: number;
  recipientEmail: string;
  subject: string;
  content: string;
  sentAt?: Date;
  isRead: boolean;
  relatedIncidentId?: number;
}

export interface EmailRequest {
  recipientEmail: string;
  subject: string;
  content: string;
  relatedIncidentId?: number;
}

export interface Notification {
  id?: number;
  recipientEmail: string;
  subject: string;
  content: string;
  sentAt?: Date;
  isRead: boolean;
  relatedIncidentId?: number;
}

// Notification types for different events
export enum NotificationType {
  INCIDENT_CREATED = 'INCIDENT_CREATED',
  INCIDENT_ASSIGNED = 'INCIDENT_ASSIGNED',
  INCIDENT_UPDATED = 'INCIDENT_UPDATED',
  INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
  SLA_VIOLATION = 'SLA_VIOLATION',
  COMMENT_ADDED = 'COMMENT_ADDED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Notification status
export enum NotificationStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

// Notification template types
export interface NotificationTemplate {
  type: NotificationType;
  subject: string;
  content: string;
  variables: string[];
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  [NotificationType.INCIDENT_CREATED]: {
    type: NotificationType.INCIDENT_CREATED,
    subject: 'Nouvel incident créé - #{incidentId}',
    content: 'Un nouvel incident a été créé avec le titre "{title}". Priorité: {priority}.',
    variables: ['incidentId', 'title', 'priority']
  },
  [NotificationType.INCIDENT_ASSIGNED]: {
    type: NotificationType.INCIDENT_ASSIGNED,
    subject: 'Incident assigné - #{incidentId}',
    content: 'L\'incident "{title}" vous a été assigné. Veuillez le traiter dans les plus brefs délais.',
    variables: ['incidentId', 'title']
  },
  [NotificationType.INCIDENT_UPDATED]: {
    type: NotificationType.INCIDENT_UPDATED,
    subject: 'Incident mis à jour - #{incidentId}',
    content: 'L\'incident "{title}" a été mis à jour. Nouveau statut: {status}.',
    variables: ['incidentId', 'title', 'status']
  },
  [NotificationType.INCIDENT_RESOLVED]: {
    type: NotificationType.INCIDENT_RESOLVED,
    subject: 'Incident résolu - #{incidentId}',
    content: 'L\'incident "{title}" a été résolu. Temps de résolution: {resolutionTime}.',
    variables: ['incidentId', 'title', 'resolutionTime']
  },
  [NotificationType.SLA_VIOLATION]: {
    type: NotificationType.SLA_VIOLATION,
    subject: 'Violation SLA - #{incidentId}',
    content: 'ALERTE: L\'incident "{title}" a dépassé le SLA. Type de violation: {violationType}.',
    variables: ['incidentId', 'title', 'violationType']
  },
  [NotificationType.COMMENT_ADDED]: {
    type: NotificationType.COMMENT_ADDED,
    subject: 'Nouveau commentaire - #{incidentId}',
    content: 'Un nouveau commentaire a été ajouté à l\'incident "{title}" par {author}.',
    variables: ['incidentId', 'title', 'author']
  },
  [NotificationType.SYSTEM_ALERT]: {
    type: NotificationType.SYSTEM_ALERT,
    subject: 'Alerte système',
    content: 'Alerte système: {message}',
    variables: ['message']
  }
};

// Helper functions for notifications
export const formatNotificationTime = (date: Date | string): string => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
  return notificationDate.toLocaleDateString('fr-FR');
};

export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.INCIDENT_CREATED:
      return 'add_alert';
    case NotificationType.INCIDENT_ASSIGNED:
      return 'assignment';
    case NotificationType.INCIDENT_UPDATED:
      return 'update';
    case NotificationType.INCIDENT_RESOLVED:
      return 'check_circle';
    case NotificationType.SLA_VIOLATION:
      return 'warning';
    case NotificationType.COMMENT_ADDED:
      return 'comment';
    case NotificationType.SYSTEM_ALERT:
      return 'error';
    default:
      return 'notifications';
  }
};

export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.INCIDENT_CREATED:
      return '#2196f3'; // Blue
    case NotificationType.INCIDENT_ASSIGNED:
      return '#ff9800'; // Orange
    case NotificationType.INCIDENT_UPDATED:
      return '#9c27b0'; // Purple
    case NotificationType.INCIDENT_RESOLVED:
      return '#4caf50'; // Green
    case NotificationType.SLA_VIOLATION:
      return '#f44336'; // Red
    case NotificationType.COMMENT_ADDED:
      return '#607d8b'; // Blue grey
    case NotificationType.SYSTEM_ALERT:
      return '#ff5722'; // Deep orange
    default:
      return '#9e9e9e'; // Grey
  }
};
