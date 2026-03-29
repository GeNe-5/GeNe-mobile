export interface InferenceFeatures {
  hr_mean: number;
  hr_std: number;
  hr_min: number;
  hr_max: number;
  rmssd_mean: number;
  rmssd_std: number;
  rmssd_min: number;
  rmssd_max: number;
  sdnn_mean: number;
  sdnn_std: number;
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

// export interface InferenceRequest {
//   features: InferenceFeatures;
//   threshold: number;
// }

export interface InferenceProbability {
  non_stress: number;
  stress: number;
}

export interface InferenceResponse {
  inference_id?: number;
  user_id?: number;
  prediction: number;
  label: string;
  probability: InferenceProbability;
  confidence: number;
  threshold: number;
  model_name: string;
  model_version: string;
  model_mode?: string;
  stress_level?: number | null;
  severity_score?: number | null;
  severity_level?: string | number | null;
  severity_components?: {
    hr_score?: number;
    rmssd_score?: number;
    sdnn_score?: number;
    lfhf_score?: number;
    eda_score?: number;
    resp_score?: number;
  } | null;
  input_summary?: {
    hr_mean?: number;
    rmssd_mean?: number;
    sdnn_mean?: number;
    lf_hf_ratio?: number;
  } | null;
  timestamp: string;
}

export interface InferenceRequestLegacy {
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
