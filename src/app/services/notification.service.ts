import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  NotificationDTO, 
  EmailRequest, 
  NotificationType,
  NOTIFICATION_TEMPLATES 
} from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.notificationApiUrl || `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Send email notification
  sendEmail(request: EmailRequest): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(`${this.apiUrl}/v1/notifications/email`, request);
  }

  // Get all notifications for current user
  getNotifications(): Observable<NotificationDTO[]> {
    const userEmail = this.authService.currentUserValue?.email;
    if (!userEmail) return new Observable(subscriber => subscriber.next([]));
    
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/v1/notifications/email/${userEmail}`);
  }

  // Get unread notifications for current user
  getUnreadNotifications(): Observable<NotificationDTO[]> {
    const userEmail = this.authService.currentUserValue?.email;
    if (!userEmail) return new Observable(subscriber => subscriber.next([]));
    
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/v1/notifications/email/${userEmail}/unread`);
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/v1/notifications/${notificationId}/read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<void> {
    const userEmail = this.authService.currentUserValue?.email;
    if (!userEmail) return new Observable(subscriber => subscriber.next());
    
    return this.http.put<void>(`${this.apiUrl}/v1/notifications/email/${userEmail}/read-all`, {});
  }

  // Get notifications by email
  getNotificationsByEmail(email: string): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/v1/notifications/email/${email}`);
  }

  // Get unread count
  getUnreadCount(): Observable<number> {
    const userEmail = this.authService.currentUserValue?.email;
    if (!userEmail) return new Observable(subscriber => subscriber.next(0));
    
    return this.http.get<number>(`${this.apiUrl}/v1/notifications/email/${userEmail}/unread-count`);
  }

  // Update unread count
  updateUnreadCount(): void {
    this.getUnreadCount().subscribe(count => {
      this.unreadCountSubject.next(count);
    });
  }

  // Send notification for incident creation
  sendIncidentCreatedNotification(incidentId: number, title: string, priority: string, recipientEmail: string): Observable<NotificationDTO> {
    const template = NOTIFICATION_TEMPLATES[NotificationType.INCIDENT_CREATED];
    const request: EmailRequest = {
      recipientEmail,
      subject: template.subject.replace('{incidentId}', incidentId.toString()),
      content: template.content
        .replace('{title}', title)
        .replace('{priority}', priority),
      relatedIncidentId: incidentId
    };
    
    return this.sendEmail(request);
  }

  // Send notification for incident assignment
  sendIncidentAssignedNotification(incidentId: number, title: string, recipientEmail: string): Observable<NotificationDTO> {
    const template = NOTIFICATION_TEMPLATES[NotificationType.INCIDENT_ASSIGNED];
    const request: EmailRequest = {
      recipientEmail,
      subject: template.subject.replace('{incidentId}', incidentId.toString()),
      content: template.content
        .replace('{title}', title),
      relatedIncidentId: incidentId
    };
    
    return this.sendEmail(request);
  }

  // Send notification for incident update
  sendIncidentUpdatedNotification(incidentId: number, title: string, status: string, recipientEmail: string): Observable<NotificationDTO> {
    const template = NOTIFICATION_TEMPLATES[NotificationType.INCIDENT_UPDATED];
    const request: EmailRequest = {
      recipientEmail,
      subject: template.subject.replace('{incidentId}', incidentId.toString()),
      content: template.content
        .replace('{title}', title)
        .replace('{status}', status),
      relatedIncidentId: incidentId
    };
    
    return this.sendEmail(request);
  }

  // Send notification for incident resolution
  sendIncidentResolvedNotification(incidentId: number, title: string, resolutionTime: string, recipientEmail: string): Observable<NotificationDTO> {
    const template = NOTIFICATION_TEMPLATES[NotificationType.INCIDENT_RESOLVED];
    const request: EmailRequest = {
      recipientEmail,
      subject: template.subject.replace('{incidentId}', incidentId.toString()),
      content: template.content
        .replace('{title}', title)
        .replace('{resolutionTime}', resolutionTime),
      relatedIncidentId: incidentId
    };
    
    return this.sendEmail(request);
  }

  // Send SLA violation notification
  sendSLAViolationNotification(incidentId: number, title: string, violationType: string, recipientEmail: string): Observable<NotificationDTO> {
    const template = NOTIFICATION_TEMPLATES[NotificationType.SLA_VIOLATION];
    const request: EmailRequest = {
      recipientEmail,
      subject: template.subject.replace('{incidentId}', incidentId.toString()),
      content: template.content
        .replace('{title}', title)
        .replace('{violationType}', violationType),
      relatedIncidentId: incidentId
    };
    
    return this.sendEmail(request);
  }

  // Send comment added notification
  sendCommentAddedNotification(incidentId: number, title: string, author: string, recipientEmail: string): Observable<NotificationDTO> {
    const template = NOTIFICATION_TEMPLATES[NotificationType.COMMENT_ADDED];
    const request: EmailRequest = {
      recipientEmail,
      subject: template.subject.replace('{incidentId}', incidentId.toString()),
      content: template.content
        .replace('{title}', title)
        .replace('{author}', author),
      relatedIncidentId: incidentId
    };
    
    return this.sendEmail(request);
  }

  // Send system alert notification
  sendSystemAlertNotification(message: string, recipientEmail: string): Observable<NotificationDTO> {
    const template = NOTIFICATION_TEMPLATES[NotificationType.SYSTEM_ALERT];
    const request: EmailRequest = {
      recipientEmail,
      subject: template.subject,
      content: template.content.replace('{message}', message)
    };
    
    return this.sendEmail(request);
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/notifications/${notificationId}`);
  }

  // Get notification settings
  getNotificationSettings(): Observable<any> {
    const userEmail = this.authService.currentUserValue?.email;
    if (!userEmail) return new Observable(subscriber => subscriber.next({}));
    
    return this.http.get<any>(`${this.apiUrl}/v1/notifications/settings/${userEmail}`);
  }

  // Update notification settings
  updateNotificationSettings(settings: any): Observable<any> {
    const userEmail = this.authService.currentUserValue?.email;
    if (!userEmail) return new Observable(subscriber => subscriber.next({}));
    
    return this.http.put<any>(`${this.apiUrl}/v1/notifications/settings/${userEmail}`, settings);
  }
}
