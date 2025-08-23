import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { SLAService } from '../../services/sla.service';
import { AuthService } from '../../services/auth.service';
import { Incident, StatutIncident } from '../../models/incident.model';
import { SLAMetricDTO, SLAViolationDTO, getComplianceColor, getComplianceLevel, ComplianceLevel } from '../../models/sla.model';
import { Chart } from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';

export enum DashboardType {
  MAIN = 'dashboard',
  SLA = 'sla',
  PERFORMANCE = 'performance',
  TECHNICIANS = 'technicians'
}

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
  currentDashboardType: DashboardType = DashboardType.MAIN;

  // KPI Data
  totalIncidents = 0;
  resolvedIncidents = 0;
  openIncidents = 0;
  slaComplianceRate = 0;
  averageResolutionTime = 0;
  overdueIncidents = 0;

  // SLA-specific metrics
  slaTargetTime = 4; // hours - default SLA target
  incidentsWithinSLA = 0;
  incidentsOverdue = 0;
  averageSLACompliance = 0;
  slaAlertLevel = 'normal'; // normal, warning, critical

  // Performance-specific metrics
  responseTime = 0; // average first response time in minutes
  resolutionRate = 0; // percentage of incidents resolved
  productivityScore = 0; // calculated productivity score
  workloadDistribution = {} as Record<number, number>; // incidents per technician
  efficiencyTrend = 'stable'; // improving, declining, stable
  teamProductivity = 0; // overall team productivity score
  averageIncidentsPerDay = 0; // average incidents handled per day
  peakPerformanceHours = ''; // hours when team is most productive

  // Charts
  technicianChart: Chart | null = null;
  slaComplianceChart: Chart | null = null;
  incidentTrendChart: Chart | null = null;
  slaTrendChart: Chart | null = null;
  performanceTrendChart: Chart | null = null;

  constructor(
    private incidentService: IncidentService,
    private slaService: SLAService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.detectDashboardType();
    this.loadDashboardData();
  }

  detectDashboardType(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/sla')) {
      this.currentDashboardType = DashboardType.SLA;
    } else if (currentUrl.includes('/performance')) {
      this.currentDashboardType = DashboardType.PERFORMANCE;
    } else if (currentUrl.includes('/technicians')) {
      this.currentDashboardType = DashboardType.TECHNICIANS;
    } else {
      this.currentDashboardType = DashboardType.MAIN;
    }
  }

  getDashboardTitle(): string {
    switch (this.currentDashboardType) {
      case DashboardType.SLA:
        return 'Suivi SLA - Accords de Niveau de Service';
      case DashboardType.PERFORMANCE:
        return 'Tableau de bord Performance - Efficacité Opérationnelle';
      case DashboardType.TECHNICIANS:
        return 'Tableau de bord Techniciens';
      default:
        return 'Tableau de bord';
    }
  }

  getDashboardSubtitle(): string {
    switch (this.currentDashboardType) {
      case DashboardType.SLA:
        return 'Surveillance et analyse des accords de niveau de service - Respect des engagements clients';
      case DashboardType.PERFORMANCE:
        return 'Évaluation de l\'efficacité opérationnelle et de la productivité des équipes';
      case DashboardType.TECHNICIANS:
        return 'Performance et productivité des techniciens';
      default:
        return 'Vue d\'ensemble des incidents et métriques';
    }
  }

  shouldShowMainKPIs(): boolean {
    return this.currentDashboardType === DashboardType.MAIN;
  }

  shouldShowSLAKPIs(): boolean {
    return this.currentDashboardType === DashboardType.SLA;
  }

  shouldShowPerformanceKPIs(): boolean {
    return this.currentDashboardType === DashboardType.PERFORMANCE;
  }

  shouldShowTechnicianKPIs(): boolean {
    return this.currentDashboardType === DashboardType.TECHNICIANS;
  }

  shouldShowTechnicianChart(): boolean {
    return this.currentDashboardType === DashboardType.TECHNICIANS || 
           this.currentDashboardType === DashboardType.PERFORMANCE;
  }

  shouldShowSLAChart(): boolean {
    return this.currentDashboardType === DashboardType.SLA;
  }

  shouldShowTrendChart(): boolean {
    return this.currentDashboardType === DashboardType.MAIN || 
           this.currentDashboardType === DashboardType.PERFORMANCE;
  }

  shouldShowSLATrendChart(): boolean {
    return this.currentDashboardType === DashboardType.SLA;
  }

  shouldShowPerformanceTrendChart(): boolean {
    return this.currentDashboardType === DashboardType.PERFORMANCE;
  }

  shouldShowViolationsTable(): boolean {
    return this.currentDashboardType === DashboardType.SLA;
  }

  getAssignedIncidentsCount(): number {
    return this.incidents.filter(i => i.assignedTechnicianId).length;
  }

  // SLA-specific methods
  calculateSLAMetrics(): void {
    const resolvedIncidents = this.incidents.filter(i => i.status === StatutIncident.RESOLU);
    
    this.incidentsWithinSLA = resolvedIncidents.filter(incident => {
      if (!incident.creationDate || !incident.resolutionDate) return false;
      const creation = new Date(incident.creationDate);
      const resolution = new Date(incident.resolutionDate);
      const resolutionTime = (resolution.getTime() - creation.getTime()) / (1000 * 60 * 60); // hours
      return resolutionTime <= this.slaTargetTime;
    }).length;

    this.incidentsOverdue = resolvedIncidents.filter(incident => {
      if (!incident.creationDate || !incident.resolutionDate) return false;
      const creation = new Date(incident.creationDate);
      const resolution = new Date(incident.resolutionDate);
      const resolutionTime = (resolution.getTime() - creation.getTime()) / (1000 * 60 * 60); // hours
      return resolutionTime > this.slaTargetTime;
    }).length;

    this.averageSLACompliance = resolvedIncidents.length > 0 ? 
      (this.incidentsWithinSLA / resolvedIncidents.length) * 100 : 0;

    // Determine SLA alert level
    if (this.averageSLACompliance >= 95) {
      this.slaAlertLevel = 'normal';
    } else if (this.averageSLACompliance >= 85) {
      this.slaAlertLevel = 'warning';
    } else {
      this.slaAlertLevel = 'critical';
    }
  }

  getSLAAlertColor(): string {
    switch (this.slaAlertLevel) {
      case 'normal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getSLAAlertIcon(): string {
    switch (this.slaAlertLevel) {
      case 'normal': return 'check_circle';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'info';
    }
  }

  getSLAAlertMessage(): string {
    switch (this.slaAlertLevel) {
      case 'normal': return 'SLA respecté';
      case 'warning': return 'Attention SLA';
      case 'critical': return 'SLA critique';
      default: return 'Information SLA';
    }
  }

  getSLAComplianceStatus(): string {
    if (this.averageSLACompliance >= 95) return 'Excellent';
    if (this.averageSLACompliance >= 85) return 'Bon';
    if (this.averageSLACompliance >= 70) return 'Moyen';
    return 'Faible';
  }

  // Performance-specific methods
  calculatePerformanceMetrics(): void {
    // Calculate resolution rate
    this.resolutionRate = this.totalIncidents > 0 ? 
      (this.resolvedIncidents / this.totalIncidents) * 100 : 0;

    // Calculate average response time (mock data - replace with actual first response time)
    this.responseTime = 15; // minutes - mock data

    // Calculate productivity score (combination of resolution rate, SLA compliance, and response time)
    const slaWeight = 0.4;
    const resolutionWeight = 0.4;
    const responseWeight = 0.2;
    
    const slaScore = this.slaComplianceRate;
    const resolutionScore = this.resolutionRate;
    const responseScore = Math.max(0, 100 - (this.responseTime / 60) * 100); // Convert to percentage
    
    this.productivityScore = (slaScore * slaWeight) + (resolutionScore * resolutionWeight) + (responseScore * responseWeight);

    // Calculate team productivity
    this.teamProductivity = this.productivityScore;

    // Calculate workload distribution
    this.workloadDistribution = this.incidents
      .filter(i => i.assignedTechnicianId)
      .reduce((acc, incident) => {
        const techId = incident.assignedTechnicianId!;
        acc[techId] = (acc[techId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    // Calculate average incidents per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIncidents = this.incidents.filter(i => {
      const creationDate = new Date(i.creationDate!);
      return creationDate >= thirtyDaysAgo;
    });
    
    this.averageIncidentsPerDay = recentIncidents.length / 30;

    // Determine efficiency trend (mock calculation)
    this.efficiencyTrend = this.productivityScore > 85 ? 'improving' : 
                          this.productivityScore < 70 ? 'declining' : 'stable';

    // Determine peak performance hours (mock data)
    this.peakPerformanceHours = '09:00-11:00';
  }

  getEfficiencyTrendIcon(): string {
    switch (this.efficiencyTrend) {
      case 'improving': return 'trending_up';
      case 'declining': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getEfficiencyTrendColor(): string {
    switch (this.efficiencyTrend) {
      case 'improving': return '#10b981';
      case 'declining': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getEfficiencyTrendMessage(): string {
    switch (this.efficiencyTrend) {
      case 'improving': return 'En amélioration';
      case 'declining': return 'En baisse';
      default: return 'Stable';
    }
  }

  getProductivityLevel(): string {
    if (this.productivityScore >= 90) return 'Excellent';
    if (this.productivityScore >= 80) return 'Bon';
    if (this.productivityScore >= 70) return 'Moyen';
    return 'À améliorer';
  }

  getProductivityColor(): string {
    if (this.productivityScore >= 90) return '#10b981';
    if (this.productivityScore >= 80) return '#3b82f6';
    if (this.productivityScore >= 70) return '#f59e0b';
    return '#ef4444';
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load incidents
    this.incidentService.getIncidents().subscribe({
      next: (incidents) => {
        this.incidents = incidents;
        this.calculateKPIs();
        this.calculateSLAMetrics();
        this.calculatePerformanceMetrics();
        
        // Create charts based on dashboard type
        if (this.shouldShowTechnicianChart()) {
          this.createTechnicianChart();
        }
        if (this.shouldShowTrendChart()) {
          this.createIncidentTrendChart();
        }
        if (this.shouldShowSLATrendChart()) {
          this.createSLATrendChart();
        }
        if (this.shouldShowPerformanceTrendChart()) {
          this.createPerformanceTrendChart();
        }
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
        if (this.shouldShowSLAChart()) {
          this.createSLAComplianceChart();
        }
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
          backgroundColor: 'rgba(111, 66, 193, 0.8)',
          borderColor: 'rgba(111, 66, 193, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(111, 66, 193, 0.1)'
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
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
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4,
          hoverBorderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                family: 'Inter',
                size: 12
              },
              color: '#64748b'
            }
          }
        },
        cutout: '60%'
      }
    });
  }

  createSLATrendChart(): void {
    const ctx = document.getElementById('slaTrendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Calculate SLA compliance trend over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const slaComplianceTrend = last7Days.map(date => {
      const dayIncidents = this.incidents.filter(i => {
        const incidentDate = new Date(i.creationDate!).toISOString().split('T')[0];
        return incidentDate === date && i.status === StatutIncident.RESOLU;
      });

      if (dayIncidents.length === 0) return 100;

      const withinSLA = dayIncidents.filter(incident => {
        if (!incident.creationDate || !incident.resolutionDate) return false;
        const creation = new Date(incident.creationDate);
        const resolution = new Date(incident.resolutionDate);
        const resolutionTime = (resolution.getTime() - creation.getTime()) / (1000 * 60 * 60);
        return resolutionTime <= this.slaTargetTime;
      }).length;

      return (withinSLA / dayIncidents.length) * 100;
    });

    this.slaTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7Days.map(date => new Date(date).toLocaleDateString('fr-FR')),
        datasets: [{
          label: 'Conformité SLA (%)',
          data: slaComplianceTrend,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(16, 185, 129, 0.1)'
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
          }
        }
      }
    });
  }

  createPerformanceTrendChart(): void {
    const ctx = document.getElementById('performanceTrendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Calculate performance trend over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const performanceTrend = last7Days.map(date => {
      const dayIncidents = this.incidents.filter(i => {
        const incidentDate = new Date(i.creationDate!).toISOString().split('T')[0];
        return incidentDate === date;
      });

      if (dayIncidents.length === 0) return 0;

      const resolvedIncidents = dayIncidents.filter(i => i.status === StatutIncident.RESOLU).length;
      const resolutionRate = (resolvedIncidents / dayIncidents.length) * 100;

      // Mock productivity calculation for the day
      return Math.min(100, resolutionRate + Math.random() * 20);
    });

    this.performanceTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7Days.map(date => new Date(date).toLocaleDateString('fr-FR')),
        datasets: [{
          label: 'Productivité (%)',
          data: performanceTrend,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(59, 130, 246, 0.1)'
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
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
          borderColor: '#6f42c1',
          backgroundColor: 'rgba(111, 66, 193, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#6f42c1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(111, 66, 193, 0.1)'
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Inter',
                size: 12
              }
            }
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
