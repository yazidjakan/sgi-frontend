import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token || ''}`
    });
  }

  // Récupérer tous les utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  // Récupérer un utilisateur par ID
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // Créer un nouvel utilisateur
  createUser(user: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user, { headers: this.getHeaders() });
  }

  // Mettre à jour un utilisateur
  updateUser(id: number, user: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user, { headers: this.getHeaders() });
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // Récupérer les techniciens
  getTechnicians(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/technicians`, { headers: this.getHeaders() });
  }

  // Récupérer les managers
  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/managers`, { headers: this.getHeaders() });
  }

  // Changer le mot de passe
  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/password`, 
      { oldPassword, newPassword }, { headers: this.getHeaders() });
  }

  // Réinitialiser le mot de passe
  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/reset-password`, { email });
  }
}
