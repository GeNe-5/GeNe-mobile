import { SensorFrame } from "../types/stream";
import { InferenceFeatures } from "../types/inference";
import { mean, std, min, max, clamp, count } from "./stats";

export const MIN_SAMPLES_FOR_INFERENCE = 10;

export const aggregateSession = (frames: SensorFrame[]): InferenceFeatures | null => {
  if (frames.length < MIN_SAMPLES_FOR_INFERENCE) {
    return null;
  }

  const lastFrame = frames[frames.length - 1];

  const heartRateValues = frames.map((f) => f.values.heart_rate);
  const rmssdValues = frames.map((f) => f.values.rmssd);
  const sdnnValues = frames.map((f) => f.values.sdnn);
  const lfHfRatioValues = frames.map((f) => f.values.lf_hf_ratio);
  const activityLevelValues = frames.map((f) => f.values.activity_level);
  const temperatureValues = frames.map((f) => f.values.temperature);
  const edaSclValues = frames.map((f) => f.values.eda_scl);
  const edaScrAmpValues = frames.map((f) => f.values.eda_scr_amp);
  const edaScrPeakValues = frames.map((f) => f.values.eda_scr_peak);
  const respRateValues = frames.map((f) => f.values.resp_rate);

  const scrIndices = frames.map((_, i) => i).filter((i) => edaScrPeakValues[i]);
  const scrAmpsAtPeaks = scrIndices.map((i) => edaScrAmpValues[i]);

  return {
    hr_mean: mean(heartRateValues),
    hr_std: std(heartRateValues),
    hr_min: min(heartRateValues),
    hr_max: max(heartRateValues),
    rmssd_mean: mean(rmssdValues),
    rmssd_std: std(rmssdValues),
    rmssd_min: min(rmssdValues),
    rmssd_max: max(rmssdValues),
    sdnn_mean: mean(sdnnValues),
    sdnn_std: std(sdnnValues),
    lf_hf_ratio: mean(lfHfRatioValues),
    activity_steps: lastFrame.values.steps_total,
    activity_calories: lastFrame.values.calories_total,
    activity_level: clamp(mean(activityLevelValues), 0, 1),
    temp_mean: mean(temperatureValues),
    temp_std: std(temperatureValues),
    temp_range: max(temperatureValues) - min(temperatureValues),
    eda_scl_mean: mean(edaSclValues),
    eda_scl_std: std(edaSclValues),
    eda_scr_count: lastFrame.values.scr_count_total,
    eda_scr_amp_mean: scrAmpsAtPeaks.length > 0 ? mean(scrAmpsAtPeaks) : 0,
    resp_rate: mean(respRateValues),
    resp_var: std(respRateValues),
  };
};

export const getSessionTotals = (frames: SensorFrame[]) => {
  if (frames.length === 0) {
    return {
      totalSteps: 0,
      totalCalories: 0,
      scrCount: 0,
    };
  }

  const lastFrame = frames[frames.length - 1];

  return {
    totalSteps: lastFrame.values.steps_total,
    totalCalories: lastFrame.values.calories_total,
    scrCount: lastFrame.values.scr_count_total,
  };
};
