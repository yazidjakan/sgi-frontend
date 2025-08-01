import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthenticationRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8075/api/v1/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    this.initializeCurrentUser();
  }

  private initializeCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next({
        id: decodedToken.id,
        username: decodedToken.sub, // Spring Security stocke le username dans 'sub'
        email: decodedToken.email,
        role: decodedToken.role || decodedToken.roles[0] // Adaptez selon votre JWT
      });
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const authRequest: AuthenticationRequest = { username, password };
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, authRequest)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(registerData: { username: string, email: string, password: string, role: string }): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/register`, registerData, {
      responseType: 'text' as 'json'
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === role : false;
  }
}
