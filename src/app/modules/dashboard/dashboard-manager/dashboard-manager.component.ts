import { Component, OnInit } from '@angular/core';
import { IncidentService } from '../../../services/incident.service';
import { SlaService } from '../../../services/sla.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-manager',
  templateUrl: './dashboard-manager.component.html',
  styleUrls: ['./dashboard-manager.component.scss']
})
export class DashboardManagerComponent implements OnInit {
  // Données KPIs
  slaComplianceRate: number = 0;
  overdueTickets: number = 0;
  totalTickets: number = 0;
  averageResolutionTime: number = 0;
  targetResolutionTime: number = 24; // Objectif en heures

  // Données graphiques
  ticketsByTechnicianChartData!: ChartData<'bar'>;
  ticketsByPriorityChartData!: ChartData<'pie'>;
  ticketsByTechnicianChartLabels: string[] = [];
  ticketsByPriorityChartLabels: string[] = [];
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };
  pieChartOptions: ChartConfiguration['options'] = { responsive: true };

  // Tableau des incidents à risque
  highRiskIncidents: any[] = [];
  highRiskColumns: string[] = ['id', 'title', 'riskScore', 'actions'];

  constructor(
    private incidentService: IncidentService,
    private slaService: SlaService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Chargement des KPIs depuis SlaService
    this.loadSlaMetrics();

    // Chargement des données graphiques depuis IncidentService
    this.loadChartData();

    // Chargement des incidents à risque depuis SlaService
    this.loadHighRiskIncidents();
  }

  loadSlaMetrics(): void {
    this.slaService.getSLAMetrics().subscribe({
      next: (metrics) => {
        this.slaComplianceRate = metrics.complianceRate;
        this.overdueTickets = metrics.overdueTickets;
        this.totalTickets = metrics.totalTickets;
        this.averageResolutionTime = metrics.averageResolutionTime;
      },
      error: (err) => console.error('Erreur chargement métriques SLA:', err)
    });
  }

  loadChartData(): void {
    this.incidentService.getAllIncidents().subscribe({
      next: (incidents) => {
        this.prepareTechnicianChart(incidents);
        this.preparePriorityChart(incidents);
      },
      error: (err) => console.error('Erreur chargement incidents:', err)
    });
  }

  prepareTechnicianChart(incidents: any[]): void {
    const technicianData = incidents.reduce((acc, incident) => {
      const technician = incident.assigneeId || 'Non assigné';
      acc[technician] = (acc[technician] || 0) + 1;
      return acc;
    }, {});

    this.ticketsByTechnicianChartLabels = Object.keys(technicianData);
    this.ticketsByTechnicianChartData = {
      labels: this.ticketsByTechnicianChartLabels,
      datasets: [{
        data: Object.values(technicianData),
        label: 'Tickets par technicien',
        backgroundColor: '#3f51b5'
      }]
    };
  }

  preparePriorityChart(incidents: any[]): void {
    const priorityData = incidents.reduce((acc, incident) => {
      acc[incident.priority] = (acc[incident.priority] || 0) + 1;
      return acc;
    }, {});

    this.ticketsByPriorityChartLabels = Object.keys(priorityData);
    this.ticketsByPriorityChartData = {
      labels: this.ticketsByPriorityChartLabels,
      datasets: [{
        data: Object.values(priorityData),
        backgroundColor: [
          '#f44336', // CRITICAL
          '#ff9800', // HIGH
          '#ffeb3b', // MEDIUM
          '#4caf50'  // LOW
        ]
      }]
    };
  }

  loadHighRiskIncidents(): void {
    this.slaService.getHighRiskIncidents().subscribe({
      next: (incidents) => {
        this.highRiskIncidents = incidents.map(incident => ({
          ...incident,
          slaRiskScore: incident.slaRiskScore || 0
        }));
      },
      error: (err) => console.error('Erreur chargement incidents à risque:', err)
    });
  }

  formatPercent(value: number): string {
    return `${Math.round(value)}%`;
  }
}
