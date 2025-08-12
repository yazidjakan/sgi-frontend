import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterDto,
  UserDto,
  RoleDto,
  UserRole
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserDto | null>;
  public currentUser: Observable<UserDto | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {
    this.currentUserSubject = new BehaviorSubject<UserDto | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserDto | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null { return localStorage.getItem('token'); }
  getToken(): string | null { return this.token; }

  login(username: string, password: string): Observable<AuthenticationResponse> {
    const request: AuthenticationRequest = { username, password };
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/v1/auth/login`, request).pipe(
      tap(response => {
        const normalized = response.roles.map(r => r.replace(/^ROLE_/, '').toUpperCase());
        const user: UserDto = {
          id: response.userId,
          username, email: '', password: '',
          roleDtos: normalized.map(n => ({ id: undefined, nom: n }))
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    this.snackBar.open('Déconnexion réussie', 'OK', { duration: 2500 });
  }

  register(username: string, email: string, password: string, role: string): Observable<any> {
    const payload = { username, email, password, role };
    return this.http.post<any>(`${this.apiUrl}/v1/auth/register`, payload);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.token;
  }

  hasRole(role: string): boolean {
    const want = role.replace(/^ROLE_/, '').toUpperCase();
    const roles = (this.currentUserValue?.roleDtos ?? []).map(r => (r.nom || '').toUpperCase());
    return roles.includes(want);
  }

  hasAnyRole(desiredRoles: string[]): boolean {
    const wants = desiredRoles.map(r => r.replace(/^ROLE_/, '').toUpperCase());
    const userRoles = (this.currentUserValue?.roleDtos ?? []).map(r => (r.nom || '').toUpperCase());
    return userRoles.some(r => wants.includes(r));
  }

  isAdmin()      { return this.hasRole(UserRole.ADMIN); }
  isManager()    { return this.hasRole(UserRole.MANAGER); }
  isTechnician() { return this.hasRole(UserRole.TECHNICIAN); }
  isUser()       { return this.hasRole(UserRole.USER); }

  // CRUD users/roles (inchangé)
  getRoles(): Observable<RoleDto[]> { return this.http.get<RoleDto[]>(`${this.apiUrl}/v1/roles`); }
  getUsers(): Observable<UserDto[]> { return this.http.get<UserDto[]>(`${this.apiUrl}/v1/users`); }
  getUserById(id: number): Observable<UserDto> { return this.http.get<UserDto>(`${this.apiUrl}/v1/users/id/${id}`); }
  createUser(userDto: UserDto): Observable<UserDto> { return this.http.post<UserDto>(`${this.apiUrl}/v1/users`, userDto); }
  updateUser(userDto: UserDto, id: number): Observable<UserDto> { return this.http.put<UserDto>(`${this.apiUrl}/v1/users/id/${id}`, userDto); }
  deleteUser(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/v1/users/id/${id}`); }
  createRole(roleDto: RoleDto): Observable<RoleDto> { return this.http.post<RoleDto>(`${this.apiUrl}/v1/roles`, roleDto); }
  updateRole(roleDto: RoleDto, id: number): Observable<RoleDto> { return this.http.put<RoleDto>(`${this.apiUrl}/v1/roles/id/${id}`, roleDto); }
  deleteRole(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/v1/roles/id/${id}`); }
}