import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { 
  ReportRequest, 
  ExportFormat, 
  ReportTemplate, 
  ReportType,
  ReportPeriod,
  getFormatIcon,
  getFormatColor,
  getFormatLabel,
  getReportTypeIcon,
  getReportTypeColor
} from '../../models/report.model';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  templates: ReportTemplate[] = [];
  reportHistory: any[] = [];
  loading = false;
  generating = false;
  selectedTemplate: ReportTemplate | null = null;
  exportFormats = Object.values(ExportFormat);
  reportTypes = Object.values(ReportType);
  reportPeriods = Object.values(ReportPeriod);
  private destroy$ = new Subject<void>();

  constructor(
    private reportService: ReportService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.reportForm = this.fb.group({
      templateName: ['', Validators.required],
      format: [ExportFormat.PDF, Validators.required],
      parameters: this.fb.group({
        incidentId: [''],
        incidentType: [''],
        timeRange: [''],
        period: [''],
        startDate: [''],
        endDate: ['']
      })
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
    this.loadReportHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplates(): void {
    this.loading = true;
    this.reportService.getReportTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (templates) => {
          this.templates = templates;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des templates:', error);
          this.toastr.error('Erreur lors du chargement des templates');
          this.loading = false;
        }
      });
  }

  loadReportHistory(): void {
    this.reportService.getReportHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.reportHistory = history;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'historique:', error);
        }
      });
  }

  onTemplateChange(templateName: string): void {
    this.selectedTemplate = this.templates.find(t => t.templateName === templateName) || null;
    this.updateFormParameters();
  }

  updateFormParameters(): void {
    if (!this.selectedTemplate) return;

    const parametersGroup = this.reportForm.get('parameters') as FormGroup;
    
    // Reset parameters based on template
    switch (this.selectedTemplate.templateName) {
      case 'incident_report':
        parametersGroup.get('incidentId')?.setValidators([Validators.required]);
        parametersGroup.get('incidentType')?.clearValidators();
        parametersGroup.get('timeRange')?.clearValidators();
        parametersGroup.get('period')?.clearValidators();
        parametersGroup.get('startDate')?.clearValidators();
        parametersGroup.get('endDate')?.clearValidators();
        break;
      case 'sla_report':
        parametersGroup.get('incidentId')?.clearValidators();
        parametersGroup.get('incidentType')?.setValidators([Validators.required]);
        parametersGroup.get('timeRange')?.setValidators([Validators.required]);
        parametersGroup.get('period')?.clearValidators();
        parametersGroup.get('startDate')?.clearValidators();
        parametersGroup.get('endDate')?.clearValidators();
        break;
      case 'performance_report':
        parametersGroup.get('incidentId')?.clearValidators();
        parametersGroup.get('incidentType')?.clearValidators();
        parametersGroup.get('timeRange')?.clearValidators();
        parametersGroup.get('period')?.setValidators([Validators.required]);
        parametersGroup.get('startDate')?.clearValidators();
        parametersGroup.get('endDate')?.clearValidators();
        break;
      case 'analytics_report':
        parametersGroup.get('incidentId')?.clearValidators();
        parametersGroup.get('incidentType')?.clearValidators();
        parametersGroup.get('timeRange')?.clearValidators();
        parametersGroup.get('period')?.clearValidators();
        parametersGroup.get('startDate')?.setValidators([Validators.required]);
        parametersGroup.get('endDate')?.setValidators([Validators.required]);
        break;
      default:
        // Clear all validators for summary report
        Object.keys(parametersGroup.controls).forEach(key => {
          parametersGroup.get(key)?.clearValidators();
        });
    }

    // Update validators
    Object.keys(parametersGroup.controls).forEach(key => {
      parametersGroup.get(key)?.updateValueAndValidity();
    });
  }

  generateReport(): void {
    if (this.reportForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs requis');
      return;
    }

    this.generating = true;
    const formValue = this.reportForm.value;
    
    const request: ReportRequest = {
      templateName: formValue.templateName,
      format: formValue.format,
      parameters: this.buildParameters(formValue.parameters)
    };

    this.reportService.generateAndDownloadReport(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Rapport généré et téléchargé avec succès');
          this.generating = false;
          this.loadReportHistory();
        },
        error: (error) => {
          console.error('Erreur lors de la génération du rapport:', error);
          this.toastr.error('Erreur lors de la génération du rapport');
          this.generating = false;
        }
      });
  }

  generateAndOpenReport(): void {
    if (this.reportForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs requis');
      return;
    }

    this.generating = true;
    const formValue = this.reportForm.value;
    
    const request: ReportRequest = {
      templateName: formValue.templateName,
      format: formValue.format,
      parameters: this.buildParameters(formValue.parameters)
    };

    this.reportService.generateAndOpenReport(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Rapport généré et ouvert dans un nouvel onglet');
          this.generating = false;
          this.loadReportHistory();
        },
        error: (error) => {
          console.error('Erreur lors de la génération du rapport:', error);
          this.toastr.error('Erreur lors de la génération du rapport');
          this.generating = false;
        }
      });
  }

  buildParameters(parameters: any): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    
    Object.keys(parameters).forEach(key => {
      if (parameters[key] !== null && parameters[key] !== undefined && parameters[key] !== '') {
        result[key] = parameters[key];
      }
    });

    return result;
  }

  exportIncidentsForAI(): void {
    this.loading = true;
    this.reportService.exportIncidentsForPrediction()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.reportService.downloadBlobAsFile(blob, 'incidents_for_ai_training.csv');
          this.toastr.success('Export CSV généré avec succès');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de l\'export CSV:', error);
          this.toastr.error('Erreur lors de l\'export CSV');
          this.loading = false;
        }
      });
  }

  downloadReport(reportId: string): void {
    this.reportService.downloadReport(reportId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.reportService.downloadBlobAsFile(blob, `report_${reportId}.pdf`);
          this.toastr.success('Rapport téléchargé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors du téléchargement:', error);
          this.toastr.error('Erreur lors du téléchargement');
        }
      });
  }

  cancelReport(reportId: string): void {
    this.reportService.cancelReport(reportId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Génération du rapport annulée');
          this.loadReportHistory();
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation:', error);
          this.toastr.error('Erreur lors de l\'annulation');
        }
      });
  }

  getFormatIcon(format: ExportFormat): string {
    return getFormatIcon(format);
  }

  getFormatColor(format: ExportFormat): string {
    return getFormatColor(format);
  }

  getFormatLabel(format: ExportFormat): string {
    return getFormatLabel(format);
  }

  getReportTypeIcon(type: string): string {
    return getReportTypeIcon(type as ReportType);
  }

  getReportTypeColor(type: string): string {
    return getReportTypeColor(type as ReportType);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return '#4caf50';
      case 'GENERATING':
        return '#ff9800';
      case 'FAILED':
        return '#f44336';
      case 'CANCELLED':
        return '#9e9e9e';
      default:
        return '#2196f3';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'check_circle';
      case 'GENERATING':
        return 'hourglass_empty';
      case 'FAILED':
        return 'error';
      case 'CANCELLED':
        return 'cancel';
      default:
        return 'pending';
    }
  }

  refreshReports(): void {
    this.loadTemplates();
    this.loadReportHistory();
    this.toastr.info('Rapports actualisés');
  }
}
