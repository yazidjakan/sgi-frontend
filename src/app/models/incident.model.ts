export interface Incident {
  id?: number;
  title: string;
  description?: string;
  priority: NiveauPriorite;
  incidentType: string;
  reporterId: number;
  assignedTechnicianId?: number;
  creationDate?: Date;
  responseDate?: Date;
  resolutionDate?: Date;
  status: StatutIncident;
}

export interface Commentaire {
  id?: number;
  content: string;
  authorId: number;
  creationDate?: Date;
  incident?: Incident;
}

export interface Attachment {
  id?: number;
  fileName: string;
  fileType?: string;
  fileData?: any;
  uploaderId: number;
  uploadDate?: Date;
  incident?: Incident;
}

export interface ActionHistory {
  id?: number;
  action: string;
  userId?: number;
  date?: Date;
  incident?: Incident;
}

export interface SLADTO {
  id?: number;
  incidentType: string;
  maxResponseTime: string;
  maxResolutionTime: string;
}

// Enums matching the backend
export enum NiveauPriorite {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  ELEVEE = 'ELEVEE',
  CRITIQUE = 'CRITIQUE'
}

export enum StatutIncident {
  BACKLOG = 'BACKLOG',
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  A_VALIDER = 'A_VALIDER',
  RESOLU = 'RESOLU'
}

// Priority colors for UI
export const PRIORITY_COLORS = {
  [NiveauPriorite.CRITIQUE]: '#f44336',
  [NiveauPriorite.ELEVEE]: '#ff9800',
  [NiveauPriorite.MOYENNE]: '#ffc107',
  [NiveauPriorite.FAIBLE]: '#4caf50'
};

// Status colors for UI
export const STATUS_COLORS = {
  [StatutIncident.BACKLOG]: '#9e9e9e',
  [StatutIncident.OUVERT]: '#2196f3',
  [StatutIncident.EN_COURS]: '#ff9800',
  [StatutIncident.A_VALIDER]: '#9c27b0',
  [StatutIncident.RESOLU]: '#4caf50'
};

// Priority labels for UI
export const PRIORITY_LABELS = {
  [NiveauPriorite.CRITIQUE]: 'Critique',
  [NiveauPriorite.ELEVEE]: 'Élevée',
  [NiveauPriorite.MOYENNE]: 'Moyenne',
  [NiveauPriorite.FAIBLE]: 'Faible'
};

// Status labels for UI
export const STATUS_LABELS = {
  [StatutIncident.BACKLOG]: 'Backlog',
  [StatutIncident.OUVERT]: 'Ouvert',
  [StatutIncident.EN_COURS]: 'En cours',
  [StatutIncident.A_VALIDER]: 'À valider',
  [StatutIncident.RESOLU]: 'Résolu'
};
