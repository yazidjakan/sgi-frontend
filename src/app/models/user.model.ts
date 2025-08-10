export interface User {
  id: number;
  nom: string;
  email: string;
  motDePasse?: string;
  role: Role;
}

export interface Role {
  id: number;
  nom: string;
}

export enum UserRole {
  UTILISATEUR = 'Utilisateur',
  TECHNICIEN = 'Technicien',
  MANAGER = 'Manager',
  ADMIN = 'Admin système'
}
