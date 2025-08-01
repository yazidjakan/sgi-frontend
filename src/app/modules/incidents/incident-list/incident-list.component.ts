import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IncidentService } from '../../../services/incident.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'TECHNICIAN' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  type: string;
  status: StatutIncident;
  priority: PriorityLevel;
  createdAt: Date;
  updatedAt: Date;
  reporter: User;
  assignee?: User;
  comments?: Commentaire[];
  attachments?: Attachment[];
  history?: ActionHistory[];
  slaRiskScore?: number;
}

export type StatutIncident = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface IncidentCreate {
  title: string;
  description: string;
  type: string;
  priority: PriorityLevel;
}

export interface IncidentUpdate {
  title?: string;
  description?: string;
  type?: string;
  priority?: PriorityLevel;
  assigneeId?: number;  // Ajoutez cette ligne
}

export interface Commentaire {
  id: number;
  content: string;
  createdAt: Date;
  author: User;
}

export interface Attachment {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  uploadedAt: Date;
  uploader: User;
}

export interface ActionHistory {
  id: number;
  actionType: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'PRIORITY_CHANGE' | 'COMMENT' | 'ATTACHMENT';
  description: string;
  performedAt: Date;
  performer: User;
  oldValue?: string;
  newValue?: string;
}

export interface IncidentFilterOptions {
  status?: StatutIncident[];
  priority?: PriorityLevel[];
  searchQuery?: string;
  reporterId?: number;
  assigneeId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
@Component({
  selector: 'app-incident-list',
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.scss']
})
export class IncidentListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'priority', 'status', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<Incident>;
  incidents: Incident[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtres
  selectedStatus: StatutIncident[] = [];
  selectedPriority: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = [];
  searchQuery: string = '';

  constructor(
    private incidentService: IncidentService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.incidents);
  }

  ngOnInit(): void {
    this.loadIncidents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadIncidents(): void {
    this.incidentService.getAllIncidents().subscribe({
      next: (incidents) => {
        this.incidents = incidents;
        this.dataSource.data = incidents;
        this.applyFilters(); // Applique les filtres initiaux
      },
      error: (err) => {
        this.snackBar.open(
          'Erreur lors du chargement des incidents',
          'Fermer',
          { duration: 5000 }
        );
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    let filteredData = [...this.incidents];

    // Filtre par statut
    if (this.selectedStatus.length > 0) {
      filteredData = filteredData.filter(incident =>
        this.selectedStatus.includes(incident.status)
      );
    }

    // Filtre par priorité
    if (this.selectedPriority.length > 0) {
      filteredData = filteredData.filter(incident =>
        this.selectedPriority.includes(incident.priority)
      );
    }

    // Filtre par recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredData = filteredData.filter(incident =>
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query)
      );
    }

    this.dataSource.data = filteredData;

    // Retour à la première page après filtrage
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.selectedStatus = [];
    this.selectedPriority = [];
    this.searchQuery = '';
    this.applyFilters();
  }

  // Méthodes pour les badges
  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'CRITICAL': 'Critique',
      'HIGH': 'Élevée',
      'MEDIUM': 'Moyenne',
      'LOW': 'Faible'
    };
    return labels[priority] || priority;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'OPEN': 'Ouvert',
      'IN_PROGRESS': 'En cours',
      'RESOLVED': 'Résolu',
      'CLOSED': 'Fermé'
    };
    return labels[status] || status;
  }

  // Actions sur les incidents
  assignToMe(incidentId: number): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (!user?.id) {
          this.snackBar.open('Utilisateur non connecté', 'Fermer', { duration: 3000 });
          return;
        }

        this.incidentService.assignIncident(incidentId, user.id)
          .subscribe({
            next: () => {
              this.snackBar.open('Incident assigné avec succès', 'Fermer', { duration: 3000 });
              this.loadIncidents();
            },
            error: (err) => {
              this.snackBar.open(
                err.error?.message || 'Erreur lors de l\'assignation',
                'Fermer',
                { duration: 5000 }
              );
            }
          });
      },
      error: () => {
        this.snackBar.open('Erreur de récupération du profil utilisateur', 'Fermer', { duration: 3000 });
      }
    });
  }

  changeStatus(incidentId: number, newStatus: StatutIncident): void {
    this.incidentService.updateStatus(incidentId, newStatus)
      .subscribe({
        next: () => {
          this.snackBar.open(`Statut changé à "${this.getStatusLabel(newStatus)}"`, 'Fermer', { duration: 3000 });
          this.loadIncidents();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Erreur lors du changement de statut',
            'Fermer',
            { duration: 5000 }
          );
        }
      });
  }
}
