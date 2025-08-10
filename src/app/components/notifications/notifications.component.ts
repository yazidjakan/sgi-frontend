import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { NotificationDTO, formatNotificationTime, getNotificationIcon, getNotificationColor } from '../../models/notification.model';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationDTO[] = [];
  unreadNotifications: NotificationDTO[] = [];
  loading = true;
  showUnreadOnly = false;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    public authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.unreadNotifications = notifications.filter(n => !n.isRead);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des notifications:', error);
          this.toastr.error('Erreur lors du chargement des notifications');
          this.loading = false;
        }
      });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          // Update unread count in service
          this.notificationService.updateUnreadCount();
        },
        error: (error) => {
          console.error('Erreur lors du chargement du compteur:', error);
        }
      });
  }

  markAsRead(notification: NotificationDTO): void {
    if (!notification.id) return;

    this.notificationService.markAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notification.id);
          this.toastr.success('Notification marquée comme lue');
          this.loadUnreadCount();
        },
        error: (error) => {
          console.error('Erreur lors du marquage comme lu:', error);
          this.toastr.error('Erreur lors du marquage comme lu');
        }
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadNotifications = [];
          this.toastr.success('Toutes les notifications marquées comme lues');
          this.loadUnreadCount();
        },
        error: (error) => {
          console.error('Erreur lors du marquage de toutes les notifications:', error);
          this.toastr.error('Erreur lors du marquage de toutes les notifications');
        }
      });
  }

  deleteNotification(notification: NotificationDTO): void {
    if (!notification.id) return;

    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notification.id);
          this.toastr.success('Notification supprimée');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastr.error('Erreur lors de la suppression');
        }
      });
  }

  toggleUnreadOnly(): void {
    this.showUnreadOnly = !this.showUnreadOnly;
  }

  getDisplayedNotifications(): NotificationDTO[] {
    if (this.showUnreadOnly) {
      return this.unreadNotifications;
    }
    return this.notifications;
  }

  getNotificationIcon(notification: NotificationDTO): string {
    // Determine icon based on notification content or subject
    if (notification.subject.includes('créé')) return 'add_alert';
    if (notification.subject.includes('assigné')) return 'assignment';
    if (notification.subject.includes('mis à jour')) return 'update';
    if (notification.subject.includes('résolu')) return 'check_circle';
    if (notification.subject.includes('Violation SLA')) return 'warning';
    if (notification.subject.includes('commentaire')) return 'comment';
    if (notification.subject.includes('Alerte système')) return 'error';
    return 'notifications';
  }

  getNotificationColor(notification: NotificationDTO): string {
    // Determine color based on notification content or subject
    if (notification.subject.includes('créé')) return '#2196f3';
    if (notification.subject.includes('assigné')) return '#ff9800';
    if (notification.subject.includes('mis à jour')) return '#9c27b0';
    if (notification.subject.includes('résolu')) return '#4caf50';
    if (notification.subject.includes('Violation SLA')) return '#f44336';
    if (notification.subject.includes('commentaire')) return '#607d8b';
    if (notification.subject.includes('Alerte système')) return '#ff5722';
    return '#9e9e9e';
  }

  formatTime(date: Date | string | undefined): string {
    if (!date) return '';
    return formatNotificationTime(date);
  }

  getUnreadCount(): number {
    return this.unreadNotifications.length;
  }

  refreshNotifications(): void {
    this.loadNotifications();
    this.toastr.info('Notifications actualisées');
  }

  openIncident(incidentId: number): void {
    // Navigate to incident details
    // This would typically use Router to navigate to incident detail page
    console.log('Opening incident:', incidentId);
  }
}
