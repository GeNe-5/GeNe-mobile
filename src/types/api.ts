export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name: string;
  birthdate?: string;
  age?: number;
  weight?: number;
}

export interface UpdateBirthdateRequest {
  birthdate: string;
}

export interface UpdateWeightRequest {
  weight: number;
}

export interface StressPredictionRequest {
  hr_mean: number;
  hr_std: number;
  hr_min: number;
  hr_max: number;
  rmssd_mean: number;
  rmssd_std: number;
  rmssd_min: number;
  rmssd_max: number;
  lf_hf_ratio: number;
  activity_steps: number;
  activity_calories: number;
  activity_level: number;
  temp_mean: number;
  temp_std: number;
  temp_range: number;
  eda_scl_mean: number;
  eda_scl_std: number;
  eda_scr_count: number;
  eda_scr_amp_mean: number;
  resp_rate: number;
  resp_var: number;
}

export interface StressPredictionResponse {
  inference_id: number;
  user_id: number;
  prediction: number;
  label: string;
  probability: {
    non_stress: number;
    stress: number;
  };
  confidence: number;
  threshold: number;
  input_summary: {
    hr_mean: number;
    rmssd_mean: number;
    lf_hf_ratio: number;
  };
}

export interface InferenceRecord {
  id: number;
  user_id: number;
  prediction: number;
  label: string;
  probability_stress: number;
  probability_non_stress: number;
  confidence: number;
  threshold: number;
  created_at: string;
}

export interface ModelStatusResponse {
  available: boolean;
  model_name: string;
  model_version: string;
  supported_formats: string[];
}

export interface ReportGenerateRequest {
  start_date?: string;
  end_date?: string;
}

export interface ApiError {
  detail: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AnalyticsRange = "today" | "week" | "month";

export interface AnalyticsChart {
  labels: string[];
  stress_values: number[];
  non_stress_values: number[];
}

export interface AnalyticsSummary {
  total_predictions: number;
  stress_count: number;
  non_stress_count: number;
  avg_confidence: number;
}

export interface AnalyticsResponse {
  range: AnalyticsRange;
  start_date: string;
  end_date: string;
  summary: AnalyticsSummary;
  chart: AnalyticsChart;
}
