import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationDTO, EmailRequest, NotificationType, NOTIFICATION_TEMPLATES } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.notificationApiUrl}/v1/notifications`; // -> /api/v1/notifications
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Email
  sendEmail(request: EmailRequest): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(`${this.base}/email`, request);
  }

  // Helpers (attention: l'email est vide tant que tu ne le récupères pas du profil)
  private userEmail(): string | null {
    return this.auth.currentUserValue?.email || null;
  }

  getNotifications(): Observable<NotificationDTO[]> {
    const email = this.userEmail();
    return email ? this.http.get<NotificationDTO[]>(`${this.base}/email/${email}`) : of([]);
  }

  getUnreadNotifications(): Observable<NotificationDTO[]> {
    const email = this.userEmail();
    return email ? this.http.get<NotificationDTO[]>(`${this.base}/email/${email}/unread`) : of([]);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    const email = this.userEmail();
    return email ? this.http.put<void>(`${this.base}/email/${email}/read-all`, {}) : of(void 0);
  }

  getNotificationsByEmail(email: string): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.base}/email/${email}`);
  }

  getUnreadCount(): Observable<number> {
    const email = this.userEmail();
    return email ? this.http.get<number>(`${this.base}/email/${email}/unread-count`) : of(0);
  }

  updateUnreadCount(): void {
    this.getUnreadCount().subscribe(c => this.unreadCountSubject.next(c));
  }

  // Templates (exemples)
  sendIncidentCreatedNotification(incidentId: number, title: string, priority: string, recipientEmail: string) {
    const t = NOTIFICATION_TEMPLATES[NotificationType.INCIDENT_CREATED];
    const req: EmailRequest = {
      recipientEmail,
      subject: t.subject.replace('{incidentId}', String(incidentId)),
      content: t.content.replace('{title}', title).replace('{priority}', priority),
      relatedIncidentId: incidentId
    };
    return this.sendEmail(req);
  }

  // ... (le reste de tes méthodes de template restent identiques, elles appellent sendEmail)
  
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${notificationId}`);
  }

  getNotificationSettings() {
    const email = this.userEmail();
    return email ? this.http.get<any>(`${this.base}/settings/${email}`) : of({});
  }

  updateNotificationSettings(settings: any) {
    const email = this.userEmail();
    return email ? this.http.put<any>(`${this.base}/settings/${email}`, settings) : of({});
  }
}