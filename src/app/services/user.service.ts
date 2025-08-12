import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/v1/users`; // -> /api/v1/users

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/id/${id}`);
  }

  createUser(user: any): Observable<User> {
    return this.http.post<User>(`${this.base}`, user);
  }

  updateUser(id: number, user: any): Observable<User> {
    return this.http.put<User>(`${this.base}/id/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/id/${id}`);
  }

  getTechnicians(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/technicians`);
  }

  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/managers`);
  }

  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.base}/id/${userId}/password`, { oldPassword, newPassword });
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.base}/reset-password`, { email });
  }
}