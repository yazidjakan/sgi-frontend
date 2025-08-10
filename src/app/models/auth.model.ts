export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
  roles: string[];
  userId: number;
}

export interface RegisterDto {
  id?: number;
  username: string;
  email: string;
  password: string;
  roles: Role[];
}

export interface Role {
  id?: number;
  nom: string;
}

export interface RoleDto {
  id?: number;
  nom: string;
}

export interface UserDto {
  id?: number;
  username: string;
  email: string;
  password: string;
  roleDtos: RoleDto[];
}

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  roles: Set<Role>;
}

// Enum for common roles
export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  MANAGER = 'ROLE_MANAGER',
  TECHNICIAN = 'ROLE_TECHNICIAN',
  USER = 'ROLE_USER'
}
