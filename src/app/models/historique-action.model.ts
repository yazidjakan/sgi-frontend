export interface HistoriqueAction {
  id: number;
  date: Date;
  utilisateur: User;
  action: string;
  incident: Incident;
}

export interface User {
  id: number;
  nom: string;
  email: string;
  role: Role;
}

export interface Role {
  id: number;
  nom: string;
}

export interface Incident {
  id: number;
  titre: string;
  description: string;
  priorite: string;
  dateCreation: Date;
  statut: Statut;
}

export enum Statut {
  BACKLOG = 'BACKLOG',
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  A_VALIDER = 'A_VALIDER',
  RESOLU = 'RESOLU'
}
