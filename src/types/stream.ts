export type StreamMode = "calm" | "stress" | "panic";

export type SocketState = "idle" | "connecting" | "listening" | "ended" | "error";

export interface SensorFrame {
  type: "sensor_frame";
  session_id: string;
  seq: number;
  mode: StreamMode;
  timestamp: string;
  values: {
    heart_rate: number;
    rmssd: number;
    sdnn: number;
    lf_hf_ratio: number;
    steps_delta: number;
    steps_total: number;
    calories_delta: number;
    calories_total: number;
    activity_level: number;
    temperature: number;
    eda_scl: number;
    eda_scr_amp: number;
    eda_scr_peak: boolean;
    scr_count_total: number;
    resp_rate: number;
  };
}

export interface StreamConfig {
  mode: StreamMode;
  intervalMs: number;
}

export interface RollingBuffer {
  values: number[];
  maxLength: number;
}

export interface MetricStats {
  current: number;
  min: number;
  max: number;
  mad: number;
}

export interface SessionMetrics {
  heartRate: MetricStats;
  rmssd: MetricStats;
  sdnn: MetricStats;
  lfHfRatio: MetricStats;
  activityLevel: MetricStats;
  temperature: MetricStats;
  edaScl: MetricStats;
  edaScrAmp: MetricStats;
  respRate: MetricStats;
  totalSteps: number;
  totalCalories: number;
  scrCount: number;
  duration: number;
  sampleCount: number;
}

export interface StreamState {
  socketState: SocketState;
  sessionId: string | null;
  startTime: number | null;
  mode: StreamMode;
  buffers: Record<string, number[]>;
  sessionData: SensorFrame["values"][];
}
