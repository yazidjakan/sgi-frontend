import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IncidentService } from '../../services/incident.service';
import { Incident, StatutIncident, NiveauPriorite, STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../../models/incident.model';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  incidents: Incident[] = [];
  backlog: Incident[] = [];
  ouvert: Incident[] = [];
  enCours: Incident[] = [];
  aValider: Incident[] = [];
  resolu: Incident[] = [];
  loading = true;

  constructor(
    private incidentService: IncidentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading = true;
    this.incidentService.getIncidents().subscribe({
      next: (incidents) => {
        this.incidents = incidents;
        this.categorizeIncidents();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des incidents:', error);
        this.toastr.error('Erreur lors du chargement des incidents');
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

  getTimeAgo(date: Date | string | undefined): string {
    if (!date) return '';
    return moment(date).fromNow();
  }

  createTicket(): void {
    // TODO: Implement ticket creation modal/form
    this.toastr.info('Fonctionnalité de création de ticket à implémenter');
  }
}
