import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  PredictionInput, 
  PredictionResponse, 
  PredictionResult,
  ModelInfo,
  TrainingDataInfo,
  PredictionHistory,
  calculateViolationProbability,
  getRecommendation
} from '../models/prediction.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = environment.predictionApiUrl || `${environment.apiUrl}/predictions`;

  constructor(private http: HttpClient) {}

  // Make prediction
  predict(input: PredictionInput): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, input);
  }

  // Make prediction with enhanced result
  predictWithDetails(input: PredictionInput): Observable<PredictionResult> {
    return new Observable(observer => {
      this.predict(input).subscribe({
        next: (response) => {
          const violationProbability = calculateViolationProbability(input);
          const recommendation = getRecommendation(response.prediction, input);
          
          const result: PredictionResult = {
            prediction: response.prediction,
            violation_probability: violationProbability,
            recommendation: recommendation
          };
          
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Get model information
  getModelInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.apiUrl}/model/info`);
  }

  // Get training data information
  getTrainingDataInfo(): Observable<TrainingDataInfo> {
    return this.http.get<TrainingDataInfo>(`${this.apiUrl}/model/training-data`);
  }

  // Get prediction history
  getPredictionHistory(): Observable<PredictionHistory[]> {
    return this.http.get<PredictionHistory[]>(`${this.apiUrl}/predictions/history`);
  }

  // Save prediction to history
  savePrediction(input: PredictionInput, result: PredictionResult): Observable<void> {
    const history: PredictionHistory = {
      input: input,
      result: result,
      timestamp: new Date(),
      status: 'SUCCESS' as any
    };
    
    return this.http.post<void>(`${this.apiUrl}/predictions/history`, history);
  }

  // Retrain model
  retrainModel(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/model/retrain`, {});
  }

  // Get model status
  getModelStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/model/status`);
  }

  // Get model accuracy
  getModelAccuracy(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/model/accuracy`);
  }

  // Get feature importance
  getFeatureImportance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/model/features/importance`);
  }

  // Get prediction statistics
  getPredictionStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/predictions/stats`);
  }

  // Batch prediction
  batchPredict(inputs: PredictionInput[]): Observable<PredictionResponse[]> {
    return this.http.post<PredictionResponse[]>(`${this.apiUrl}/predict/batch`, inputs);
  }

  // Validate prediction input
  validatePredictionInput(input: PredictionInput): boolean {
    return (
      !!input.type_incident &&
      input.priorite >= 1 && input.priorite <= 4 &&
      input.response_time >= 0 &&
      input.resolution_time >= 0 &&
      input.max_response > 0 &&
      input.max_resolution > 0
    );
  }

  // Get prediction confidence
  getPredictionConfidence(input: PredictionInput): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/predict/confidence`, input);
  }

  // Get model performance metrics
  getModelPerformance(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/model/performance`);
  }

  // Export prediction results
  exportPredictions(format: 'csv' | 'json' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/predictions/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Get prediction explanations
  getPredictionExplanation(input: PredictionInput): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/predict/explain`, input);
  }

  // Get model version
  getModelVersion(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/model/version`);
  }

  // Check if model is loaded
  isModelLoaded(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/model/loaded`);
  }

  // Get available incident types
  getAvailableIncidentTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/model/incident-types`);
  }

  // Get model training history
  getTrainingHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/model/training/history`);
  }

  // Test model with sample data
  testModel(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/model/test`, {});
  }

  // Get prediction recommendations
  getRecommendations(input: PredictionInput): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl}/predict/recommendations`, input);
  }

  // Helper method to download blob as file
  downloadBlobAsFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Export predictions and download
  exportAndDownloadPredictions(format: 'csv' | 'json' = 'csv'): Observable<void> {
    return new Observable(observer => {
      this.exportPredictions(format).subscribe({
        next: (blob) => {
          const fileName = `predictions_${new Date().toISOString().split('T')[0]}.${format}`;
          this.downloadBlobAsFile(blob, fileName);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}
