export interface PredictionInput {
  type_incident: string;
  priorite: number;
  response_time: number;
  resolution_time: number;
  max_response: number;
  max_resolution: number;
}

export interface PredictionResponse {
  prediction: number; // 0 or 1 (violation or not)
}

export interface PredictionResult {
  prediction: number;
  confidence?: number;
  violation_probability?: number;
  recommendation?: string;
}

// Incident types for prediction
export enum IncidentType {
  BUG = 'Bug',
  FEATURE = 'Feature',
  IMPROVEMENT = 'Improvement',
  DOCUMENTATION = 'Documentation',
  SECURITY = 'Security',
  PERFORMANCE = 'Performance',
  USABILITY = 'Usability',
  COMPATIBILITY = 'Compatibility'
}

// Priority levels for prediction
export enum PriorityLevel {
  CRITICAL = 4,
  HIGH = 3,
  MEDIUM = 2,
  LOW = 1
}

// Prediction status
export enum PredictionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  MODEL_NOT_LOADED = 'MODEL_NOT_LOADED'
}

// Model information
export interface ModelInfo {
  model_type: string;
  accuracy?: number;
  last_trained?: Date;
  features: string[];
  version: string;
}

// Training data info
export interface TrainingDataInfo {
  total_incidents: number;
  training_date: Date;
  data_source: string;
  features_count: number;
}

// Prediction history
export interface PredictionHistory {
  id?: string;
  input: PredictionInput;
  result: PredictionResult;
  timestamp: Date;
  status: PredictionStatus;
  model_version?: string;
}

// Helper functions for predictions
export const getViolationLabel = (prediction: number): string => {
  return prediction === 1 ? 'Violation SLA' : 'Conforme SLA';
};

export const getViolationColor = (prediction: number): string => {
  return prediction === 1 ? '#f44336' : '#4caf50';
};

export const getViolationIcon = (prediction: number): string => {
  return prediction === 1 ? 'warning' : 'check_circle';
};

export const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case PriorityLevel.CRITICAL:
      return 'Critique';
    case PriorityLevel.HIGH:
      return 'Élevée';
    case PriorityLevel.MEDIUM:
      return 'Moyenne';
    case PriorityLevel.LOW:
      return 'Faible';
    default:
      return 'Inconnue';
  }
};

export const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case PriorityLevel.CRITICAL:
      return '#f44336';
    case PriorityLevel.HIGH:
      return '#ff9800';
    case PriorityLevel.MEDIUM:
      return '#ffc107';
    case PriorityLevel.LOW:
      return '#4caf50';
    default:
      return '#9e9e9e';
  }
};

export const getIncidentTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'bug':
      return 'bug_report';
    case 'feature':
      return 'add_circle';
    case 'improvement':
      return 'trending_up';
    case 'documentation':
      return 'description';
    case 'security':
      return 'security';
    case 'performance':
      return 'speed';
    case 'usability':
      return 'accessibility';
    case 'compatibility':
      return 'sync';
    default:
      return 'help';
  }
};

export const getIncidentTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'bug':
      return '#f44336';
    case 'feature':
      return '#2196f3';
    case 'improvement':
      return '#4caf50';
    case 'documentation':
      return '#ff9800';
    case 'security':
      return '#9c27b0';
    case 'performance':
      return '#00bcd4';
    case 'usability':
      return '#607d8b';
    case 'compatibility':
      return '#795548';
    default:
      return '#9e9e9e';
  }
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
  }
};

export const calculateViolationProbability = (input: PredictionInput): number => {
  // Simple heuristic based on response and resolution times
  const responseRatio = input.response_time / input.max_response;
  const resolutionRatio = input.resolution_time / input.max_resolution;
  
  // Higher priority increases probability
  const priorityFactor = input.priorite / 4;
  
  // Calculate probability based on time ratios and priority
  const probability = Math.min(0.95, (responseRatio + resolutionRatio) / 2 * priorityFactor);
  
  return Math.round(probability * 100);
};

export const getRecommendation = (prediction: number, input: PredictionInput): string => {
  if (prediction === 1) {
    // Violation predicted
    if (input.response_time > input.max_response) {
      return 'Réduire le temps de réponse pour respecter le SLA';
    } else if (input.resolution_time > input.max_resolution) {
      return 'Accélérer la résolution pour éviter la violation SLA';
    } else {
      return 'Revoir les critères SLA pour ce type d\'incident';
    }
  } else {
    // No violation predicted
    return 'Les temps actuels respectent les critères SLA';
  }
};
