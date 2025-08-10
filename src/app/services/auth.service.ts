import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { 
  AuthenticationRequest, 
  AuthenticationResponse, 
  RegisterDto, 
  UserDto, 
  RoleDto,
  UserRole 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserDto | null>;
  public currentUser: Observable<UserDto | null>;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.currentUserSubject = new BehaviorSubject<UserDto | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserDto | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<AuthenticationResponse> {
    const request: AuthenticationRequest = { username, password };
    
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/v1/auth/login`, request)
      .pipe(
        tap(response => {
          // Store user details and jwt token in local storage
          const user: UserDto = {
            id: response.userId,
            username: username,
            email: '', // Will be fetched separately if needed
            password: '',
            roleDtos: response.roles.map(role => ({ id: undefined, nom: role }))
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    this.toastr.success('Déconnexion réussie');
  }

  register(registerDto: RegisterDto): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/v1/auth/register`, registerDto);
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null && localStorage.getItem('token') !== null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roleDtos) return false;
    return user.roleDtos.some(r => r.nom === role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roleDtos) return false;
    return user.roleDtos.some(r => roles.includes(r.nom));
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isManager(): boolean {
    return this.hasRole(UserRole.MANAGER);
  }

  isTechnician(): boolean {
    return this.hasRole(UserRole.TECHNICIAN);
  }

  isUser(): boolean {
    return this.hasRole(UserRole.USER);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get all roles from the backend
  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.apiUrl}/v1/roles`);
  }

  // Get all users (admin only)
  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/v1/users`);
  }

  // Get user by ID
  getUserById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/v1/users/id/${id}`);
  }

  // Create new user
  createUser(userDto: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/v1/users`, userDto);
  }

  // Update user
  updateUser(userDto: UserDto, id: number): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/v1/users/id/${id}`, userDto);
  }

  // Delete user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/users/id/${id}`);
  }

  // Create new role
  createRole(roleDto: RoleDto): Observable<RoleDto> {
    return this.http.post<RoleDto>(`${this.apiUrl}/v1/roles`, roleDto);
  }

  // Update role
  updateRole(roleDto: RoleDto, id: number): Observable<RoleDto> {
    return this.http.put<RoleDto>(`${this.apiUrl}/v1/roles/id/${id}`, roleDto);
  }

  // Delete role
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/roles/id/${id}`);
  }
}
