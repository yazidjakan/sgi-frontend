import { Component, OnInit } from '@angular/core';
import { IncidentService } from '../../services/incident.service';
import { SLAService } from '../../services/sla.service';
import { AuthService } from '../../services/auth.service';
import { Incident, StatutIncident } from '../../models/incident.model';
import { SLAMetricDTO, SLAViolationDTO, getComplianceColor, getComplianceLevel, ComplianceLevel } from '../../models/sla.model';
import { Chart } from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  incidents: Incident[] = [];
  slaMetrics: SLAMetricDTO[] = [];
  slaViolations: SLAViolationDTO[] = [];
  loading = true;

  // KPI Data
  totalIncidents = 0;
  resolvedIncidents = 0;
  openIncidents = 0;
  slaComplianceRate = 0;
  averageResolutionTime = 0;
  overdueIncidents = 0;

  // Charts
  technicianChart: Chart | null = null;
  slaComplianceChart: Chart | null = null;
  incidentTrendChart: Chart | null = null;

  constructor(
    private incidentService: IncidentService,
    private slaService: SLAService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load incidents
    this.incidentService.getIncidents().subscribe({
      next: (incidents) => {
        this.incidents = incidents;
        this.calculateKPIs();
        this.createTechnicianChart();
        this.createIncidentTrendChart();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des incidents:', error);
        this.toastr.error('Erreur lors du chargement des incidents');
      }
    });

    // Load SLA metrics
    this.slaService.getDashboardMetrics().subscribe({
      next: (metrics) => {
        this.slaMetrics = metrics;
        this.createSLAComplianceChart();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des métriques SLA:', error);
      }
    });

    // Load SLA violations
    this.slaService.getViolations().subscribe({
      next: (violations) => {
        this.slaViolations = violations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des violations SLA:', error);
        this.loading = false;
      }
    });
  }

  calculateKPIs(): void {
    this.totalIncidents = this.incidents.length;
    this.resolvedIncidents = this.incidents.filter(i => i.status === StatutIncident.RESOLU).length;
    this.openIncidents = this.incidents.filter(i => 
      i.status === StatutIncident.OUVERT || 
      i.status === StatutIncident.EN_COURS || 
      i.status === StatutIncident.A_VALIDER
    ).length;

    // Calculate SLA compliance rate
    if (this.slaMetrics.length > 0) {
      this.slaComplianceRate = this.slaMetrics.reduce((sum, metric) => sum + metric.complianceRate, 0) / this.slaMetrics.length;
    }

    // Calculate average resolution time
    const resolvedIncidents = this.incidents.filter(i => i.status === StatutIncident.RESOLU && i.creationDate && i.resolutionDate);
    if (resolvedIncidents.length > 0) {
      const totalTime = resolvedIncidents.reduce((sum, incident) => {
        const creation = new Date(incident.creationDate!);
        const resolution = new Date(incident.resolutionDate!);
        return sum + (resolution.getTime() - creation.getTime());
      }, 0);
      this.averageResolutionTime = totalTime / resolvedIncidents.length / (1000 * 60 * 60); // Hours
    }

    // Count overdue incidents
    this.overdueIncidents = this.slaViolations.length;
  }

  createTechnicianChart(): void {
    const ctx = document.getElementById('technicianChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Group incidents by assigned technician
    const technicianData = this.incidents
      .filter(i => i.assignedTechnicianId)
      .reduce((acc, incident) => {
        const techId = incident.assignedTechnicianId!;
        if (!acc[techId]) {
          acc[techId] = { resolved: 0, total: 0 };
        }
        acc[techId].total++;
        if (incident.status === StatutIncident.RESOLU) {
          acc[techId].resolved++;
        }
        return acc;
      }, {} as Record<number, { resolved: number; total: number }>);

    const labels = Object.keys(technicianData).map(id => `Technicien ${id}`);
    const data = Object.values(technicianData).map(tech => (tech.resolved / tech.total) * 100);

    this.technicianChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taux de résolution (%)',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  createSLAComplianceChart(): void {
    const ctx = document.getElementById('slaComplianceChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = this.slaMetrics.map(m => `SLA ${m.slaId}`);
    const data = this.slaMetrics.map(m => m.complianceRate);
    const colors = this.slaMetrics.map(m => getComplianceColor(m.complianceRate));

    this.slaComplianceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  createIncidentTrendChart(): void {
    const ctx = document.getElementById('incidentTrendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Group incidents by creation date (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const incidentCounts = last7Days.map(date => {
      return this.incidents.filter(i => {
        const incidentDate = new Date(i.creationDate!).toISOString().split('T')[0];
        return incidentDate === date;
      }).length;
    });

    this.incidentTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7Days.map(date => new Date(date).toLocaleDateString('fr-FR')),
        datasets: [{
          label: 'Incidents créés',
          data: incidentCounts,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  getComplianceLevel(rate: number): ComplianceLevel {
    return getComplianceLevel(rate);
  }

  getComplianceColor(rate: number): string {
    return getComplianceColor(rate);
  }

  getComplianceLabel(level: ComplianceLevel): string {
    switch (level) {
      case ComplianceLevel.EXCELLENT: return 'Excellent';
      case ComplianceLevel.GOOD: return 'Bon';
      case ComplianceLevel.AVERAGE: return 'Moyen';
      case ComplianceLevel.POOR: return 'Faible';
      case ComplianceLevel.CRITICAL: return 'Critique';
      default: return 'Inconnu';
    }
  }

  refreshData(): void {
    this.loadDashboardData();
    this.toastr.success('Données actualisées');
  }

  formatDuration(duration: string): string {
    // Parse ISO 8601 duration format (e.g., "PT2H30M")
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}min`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else if (minutes > 0) {
        return `${minutes}min`;
      }
    }
    return duration;
  }
}
