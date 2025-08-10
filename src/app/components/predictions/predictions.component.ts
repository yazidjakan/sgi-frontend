import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PredictionService } from '../../services/prediction.service';
import { 
  PredictionInput, 
  PredictionResult,
  IncidentType,
  PriorityLevel,
  ModelInfo,
  TrainingDataInfo,
  PredictionHistory,
  getViolationLabel,
  getViolationColor,
  getViolationIcon,
  getPriorityLabel,
  getPriorityColor,
  getIncidentTypeIcon,
  getIncidentTypeColor,
  formatTime
} from '../../models/prediction.model';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss']
})
export class PredictionsComponent implements OnInit, OnDestroy {
  predictionForm: FormGroup;
  predictionResult: PredictionResult | null = null;
  modelInfo: ModelInfo | null = null;
  trainingDataInfo: TrainingDataInfo | null = null;
  predictionHistory: PredictionHistory[] = [];
  loading = false;
  predicting = false;
  incidentTypes = Object.values(IncidentType);
  priorityLevels = Object.values(PriorityLevel);
  private destroy$ = new Subject<void>();

  constructor(
    private predictionService: PredictionService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.predictionForm = this.fb.group({
      type_incident: ['', Validators.required],
      priorite: [PriorityLevel.MEDIUM, [Validators.required, Validators.min(1), Validators.max(4)]],
      response_time: [0, [Validators.required, Validators.min(0)]],
      resolution_time: [0, [Validators.required, Validators.min(0)]],
      max_response: [60, [Validators.required, Validators.min(1)]],
      max_resolution: [240, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadModelInfo();
    this.loadTrainingDataInfo();
    this.loadPredictionHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadModelInfo(): void {
    this.predictionService.getModelInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (info) => {
          this.modelInfo = info;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des infos du modèle:', error);
        }
      });
  }

  loadTrainingDataInfo(): void {
    this.predictionService.getTrainingDataInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (info) => {
          this.trainingDataInfo = info;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des infos d\'entraînement:', error);
        }
      });
  }

  loadPredictionHistory(): void {
    this.predictionService.getPredictionHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.predictionHistory = history;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'historique:', error);
        }
      });
  }

  makePrediction(): void {
    if (this.predictionForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs requis');
      return;
    }

    this.predicting = true;
    const input: PredictionInput = this.predictionForm.value;

    this.predictionService.predictWithDetails(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.predictionResult = result;
          this.savePredictionToHistory(input, result);
          this.toastr.success('Prédiction effectuée avec succès');
          this.predicting = false;
        },
        error: (error) => {
          console.error('Erreur lors de la prédiction:', error);
          this.toastr.error('Erreur lors de la prédiction');
          this.predicting = false;
        }
      });
  }

  savePredictionToHistory(input: PredictionInput, result: PredictionResult): void {
    this.predictionService.savePrediction(input, result)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPredictionHistory();
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
        }
      });
  }

  retrainModel(): void {
    this.loading = true;
    this.predictionService.retrainModel()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Modèle réentraîné avec succès');
          this.loadModelInfo();
          this.loadTrainingDataInfo();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du réentraînement:', error);
          this.toastr.error('Erreur lors du réentraînement');
          this.loading = false;
        }
      });
  }

  exportPredictions(): void {
    this.predictionService.exportAndDownloadPredictions('csv')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Prédictions exportées avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de l\'export:', error);
          this.toastr.error('Erreur lors de l\'export');
        }
      });
  }

  clearForm(): void {
    this.predictionForm.reset({
      type_incident: '',
      priorite: PriorityLevel.MEDIUM,
      response_time: 0,
      resolution_time: 0,
      max_response: 60,
      max_resolution: 240
    });
    this.predictionResult = null;
  }

  getViolationLabel(prediction: number): string {
    return getViolationLabel(prediction);
  }

  getViolationColor(prediction: number): string {
    return getViolationColor(prediction);
  }

  getViolationIcon(prediction: number): string {
    return getViolationIcon(prediction);
  }

  getPriorityLabel(priority: number): string {
    return getPriorityLabel(priority);
  }

  getPriorityColor(priority: number): string {
    return getPriorityColor(priority);
  }

  getIncidentTypeIcon(type: string): string {
    return getIncidentTypeIcon(type);
  }

  getIncidentTypeColor(type: string): string {
    return getIncidentTypeColor(type);
  }

  formatTime(minutes: number): string {
    return formatTime(minutes);
  }

  getModelAccuracyColor(accuracy: number): string {
    if (accuracy >= 90) return '#4caf50';
    if (accuracy >= 75) return '#8bc34a';
    if (accuracy >= 60) return '#ffc107';
    if (accuracy >= 50) return '#ff9800';
    return '#f44336';
  }

  getModelAccuracyIcon(accuracy: number): string {
    if (accuracy >= 90) return 'check_circle';
    if (accuracy >= 75) return 'thumb_up';
    if (accuracy >= 60) return 'help';
    if (accuracy >= 50) return 'warning';
    return 'error';
  }

  refreshPredictions(): void {
    this.loadModelInfo();
    this.loadTrainingDataInfo();
    this.loadPredictionHistory();
    this.toastr.info('Prédictions actualisées');
  }

  onIncidentTypeChange(): void {
    // Auto-fill SLA times based on incident type
    const incidentType = this.predictionForm.get('type_incident')?.value;
    if (incidentType) {
      switch (incidentType.toLowerCase()) {
        case 'bug':
          this.predictionForm.patchValue({
            max_response: 30,
            max_resolution: 120
          });
          break;
        case 'feature':
          this.predictionForm.patchValue({
            max_response: 60,
            max_resolution: 240
          });
          break;
        case 'security':
          this.predictionForm.patchValue({
            max_response: 15,
            max_resolution: 60
          });
          break;
        case 'performance':
          this.predictionForm.patchValue({
            max_response: 45,
            max_resolution: 180
          });
          break;
        default:
          this.predictionForm.patchValue({
            max_response: 60,
            max_resolution: 240
          });
      }
    }
  }
}
