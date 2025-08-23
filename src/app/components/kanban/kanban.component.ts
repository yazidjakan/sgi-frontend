import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IncidentService } from '../../services/incident.service';
import { Incident, StatutIncident, NiveauPriorite, STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../../models/incident.model';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { TicketDialogComponent } from './ticket-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit, AfterViewInit {
  incidents: Incident[] = [];
  backlog: Incident[] = [];
  ouvert: Incident[] = [];
  enCours: Incident[] = [];
  aValider: Incident[] = [];
  resolu: Incident[] = [];
  loading = true;
  isOver: { [key: string]: boolean } = {
    backlog: false,
    ouvert: false,
    enCours: false,
    aValider: false,
    resolu: false
  };
  searchTerm = '';

  userIdToUser: { [id: number]: User } = {};
  
  @ViewChild('kanbanBoard', { static: false }) kanbanBoard!: ElementRef;
  canScrollLeft = false;
  canScrollRight = false;

  constructor(
    private incidentService: IncidentService,
    private toastr: ToastrService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  ngAfterViewInit(): void {
    this.updateScrollButtons();
    // Listen for window resize to update scroll buttons
    window.addEventListener('resize', () => this.updateScrollButtons());
  }

  loadIncidents(): void {
    this.loading = true;
    this.incidentService.getIncidents().subscribe({
      next: (incidents) => {
        this.incidents = incidents;
        this.categorizeIncidents();
        this.loadUsersForDisplay();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des incidents:', error);
        this.toastr.error('Erreur lors du chargement des incidents');
        this.loading = false;
      }
    });
  }

  private loadUsersForDisplay(): void {
    // Load users once and keep in a map for fast lookup
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.userIdToUser = users.reduce((map: { [id: number]: User }, user: User) => {
          map[user.id] = user;
          return map;
        }, {});
        this.loading = false;
      },
      error: () => {
        // Even if users cannot be loaded, continue showing incidents
        this.loading = false;
      }
    });
  }

  categorizeIncidents(): void {
    this.backlog = this.incidents.filter(i => i.status === StatutIncident.BACKLOG);
    this.ouvert = this.incidents.filter(i => i.status === StatutIncident.OUVERT);
    this.enCours = this.incidents.filter(i => i.status === StatutIncident.EN_COURS);
    this.aValider = this.incidents.filter(i => i.status === StatutIncident.A_VALIDER);
    this.resolu = this.incidents.filter(i => i.status === StatutIncident.RESOLU);
  }

  onDrop(event: CdkDragDrop<Incident[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const incident = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainer(event.container.id);
      
      this.updateIncidentStatus(incident.id!, newStatus);
    }
    // Clear highlight on drop
    this.clearOverState();
  }

  private getStatusFromContainer(containerId: string): StatutIncident {
    switch (containerId) {
      case 'backlog': return StatutIncident.BACKLOG;
      case 'ouvert': return StatutIncident.OUVERT;
      case 'enCours': return StatutIncident.EN_COURS;
      case 'aValider': return StatutIncident.A_VALIDER;
      case 'resolu': return StatutIncident.RESOLU;
      default: return StatutIncident.BACKLOG;
    }
  }

  private updateIncidentStatus(incidentId: number, status: StatutIncident): void {
    this.incidentService.updateStatus(incidentId, status).subscribe({
      next: (updatedIncident) => {
        this.toastr.success(`Incident déplacé vers ${STATUS_LABELS[status]}`);
        // Update the incident in the local array
        const index = this.incidents.findIndex(i => i.id === incidentId);
        if (index !== -1) {
          this.incidents[index] = updatedIncident;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.toastr.error('Erreur lors de la mise à jour du statut');
        // Reload incidents to reset the view
        this.loadIncidents();
      }
    });
  }

  getPriorityColor(priority: NiveauPriorite): string {
    return PRIORITY_COLORS[priority] || '#9e9e9e';
  }

  getStatusColor(status: StatutIncident): string {
    return STATUS_COLORS[status] || '#9e9e9e';
  }

  getPriorityLabel(priority: NiveauPriorite): string {
    return PRIORITY_LABELS[priority] || priority;
  }

  getStatusLabel(status: StatutIncident): string {
    return STATUS_LABELS[status] || status;
  }

  getAssignee(incident: Incident): User | undefined {
    const userId = incident.assignedTechnicianId ?? incident.reporterId;
    return userId ? this.userIdToUser[userId] : undefined;
  }

  getAssigneeName(incident: Incident): string {
    const user = this.getAssignee(incident);
    return user ? user.nom : 'Non assigné';
  }

  getAssigneeInitials(incident: Incident): string {
    const name = this.getAssigneeName(incident);
    if (!name || name === 'Non assigné') return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) || '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  getAvatarColor(incident: Incident): string {
    const user = this.getAssignee(incident);
    const seed = user ? user.id : -1;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
    const index = seed >= 0 ? seed % colors.length : 0;
    return colors[index];
  }

  onListEntered(listId: string): void {
    this.isOver[listId] = true;
  }

  onListExited(listId: string): void {
    this.isOver[listId] = false;
  }

  private clearOverState(): void {
    Object.keys(this.isOver).forEach(k => (this.isOver[k] = false));
  }



  onSearch(term: string): void {
    this.searchTerm = term || '';
    // No need to mutate arrays; template filters render only matches
  }

  matchesSearch(incident: Incident): boolean {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) return true;
    const title = (incident.title || '').toLowerCase();
    const description = (incident.description || '').toLowerCase();
    const type = (incident.incidentType || '').toLowerCase();
    const idText = `#${incident.id ?? ''}`.toLowerCase();
    const assignee = (this.getAssigneeName(incident) || '').toLowerCase();
    return (
      title.includes(term) ||
      description.includes(term) ||
      type.includes(term) ||
      idText.includes(term) ||
      assignee.includes(term)
    );
  }

  getFilteredCount(columnId: 'backlog'|'ouvert'|'enCours'|'aValider'|'resolu'): number {
    const list = this[columnId] as Incident[];
    return list.reduce((count, inc) => count + (this.matchesSearch(inc) ? 1 : 0), 0);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

  getTimeAgo(date: Date | string | undefined): string {
    if (!date) return '';
    return moment(date).fromNow();
  }

  createTicket(): void {
    const ref = this.dialog.open(TicketDialogComponent, {
      width: '520px',
      data: { defaultStatus: StatutIncident.BACKLOG }
    });
    ref.afterClosed().subscribe((created?: Incident) => {
      if (created) {
        this.toastr.success('Incident créé');
        this.incidents.unshift(created);
        this.categorizeIncidents();
      }
    });
  }

  scrollLeft(): void {
    if (this.kanbanBoard) {
      this.kanbanBoard.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  scrollRight(): void {
    if (this.kanbanBoard) {
      this.kanbanBoard.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  private updateScrollButtons(): void {
    if (this.kanbanBoard) {
      const element = this.kanbanBoard.nativeElement;
      this.canScrollLeft = element.scrollLeft > 0;
      this.canScrollRight = element.scrollLeft < (element.scrollWidth - element.clientWidth);
    }
  }
}
