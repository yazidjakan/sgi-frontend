import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PredictionInput, PredictionResponse, PredictionResult,
  ModelInfo, TrainingDataInfo, PredictionHistory,
  calculateViolationProbability, getRecommendation
} from '../models/prediction.model';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private base = `${environment.predictionApiUrl}/v1/predictions`; // -> /api/v1/predictions

  constructor(private http: HttpClient) {}

  predict(input: PredictionInput): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.base}/predict`, input);
  }

  predictWithDetails(input: PredictionInput): Observable<PredictionResult> {
    return new Observable(observer => {
      this.predict(input).subscribe({
        next: (res) => {
          const violationProbability = calculateViolationProbability(input);
          const recommendation = getRecommendation(res.prediction, input);
          observer.next({ prediction: res.prediction, violation_probability: violationProbability, recommendation });
          observer.complete();
        },
        error: (e) => observer.error(e)
      });
    });
  }

  getModelInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.base}/model/info`);
  }

  getTrainingDataInfo(): Observable<TrainingDataInfo> {
    return this.http.get<TrainingDataInfo>(`${this.base}/model/training-data`);
  }

  getPredictionHistory(): Observable<PredictionHistory[]> {
    return this.http.get<PredictionHistory[]>(`${this.base}/history`);
  }

  savePrediction(input: PredictionInput, result: PredictionResult): Observable<void> {
    const history: PredictionHistory = { input, result, timestamp: new Date(), status: 'SUCCESS' as any };
    return this.http.post<void>(`${this.base}/history`, history);
  }

  retrainModel(): Observable<any> {
    return this.http.post<any>(`${this.base}/model/retrain`, {});
  }

  getModelStatus(): Observable<any> {
    return this.http.get<any>(`${this.base}/model/status`);
  }

  getModelAccuracy(): Observable<number> {
    return this.http.get<number>(`${this.base}/model/accuracy`);
  }

  getFeatureImportance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/model/features/importance`);
  }

  getPredictionStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/stats`);
  }

  batchPredict(inputs: PredictionInput[]): Observable<PredictionResponse[]> {
    return this.http.post<PredictionResponse[]>(`${this.base}/predict/batch`, inputs);
  }

  getPredictionConfidence(input: PredictionInput): Observable<number> {
    return this.http.post<number>(`${this.base}/predict/confidence`, input);
  }

  exportPredictions(format: 'csv' | 'json' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.base}/export`, { params: { format }, responseType: 'blob' });
  }

  getPredictionExplanation(input: PredictionInput): Observable<any> {
    return this.http.post<any>(`${this.base}/predict/explain`, input);
  }

  getModelVersion(): Observable<string> {
    return this.http.get<string>(`${this.base}/model/version`);
  }

  isModelLoaded(): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/model/loaded`);
  }

  getAvailableIncidentTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/model/incident-types`);
  }

  getTrainingHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/model/training/history`);
  }

  testModel(): Observable<any> {
    return this.http.post<any>(`${this.base}/model/test`, {});
  }

  getRecommendations(input: PredictionInput): Observable<string[]> {
    return this.http.post<string[]>(`${this.base}/predict/recommendations`, input);
  }

  // Utils (identiques)
  downloadBlobAsFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = fileName; link.click();
    window.URL.revokeObjectURL(url);
  }

  exportAndDownloadPredictions(format: 'csv' | 'json' = 'csv'): Observable<void> {
    return new Observable(observer => {
      this.exportPredictions(format).subscribe({
        next: (blob) => { this.downloadBlobAsFile(blob, `predictions_${new Date().toISOString().split('T')[0]}.${format}`); observer.next(); observer.complete(); },
        error: (err) => observer.error(err)
      });
    });
  }
}