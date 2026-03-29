import { useState, useCallback, useRef, useEffect } from "react";
import { SocketState, SensorFrame, SessionMetrics, MetricStats } from "../types/stream";
import { InferenceFeatures } from "../types/inference";
import { streamSocket } from "../services/streamSocket";
import { aggregateSession, getSessionTotals, MIN_SAMPLES_FOR_INFERENCE } from "../utils/inferenceAggregation";
import { mean, min as statsMin, max as statsMax, mad, sum } from "../utils/stats";

const BUFFER_SIZE = 60;

interface UsePhysioStreamReturn {
  socketState: SocketState;
  sessionMetrics: SessionMetrics | null;
  buffers: Record<string, number[]>;
  startListening: () => void;
  stopListening: () => void;
  resetSession: () => void;
  aggregatedFeatures: InferenceFeatures | null;
  sessionData: SensorFrame["values"][];
  sampleCount: number;
}

const createEmptyBuffers = (): Record<string, number[]> => ({
  heartRate: [],
  rmssd: [],
  sdnn: [],
  lfHfRatio: [],
  activityLevel: [],
  temperature: [],
  edaScl: [],
  edaScrAmp: [],
  respRate: [],
});

const computeMetricStats = (values: number[]): MetricStats => {
  if (values.length === 0) {
    return { current: 0, min: 0, max: 0, mad: 0 };
  }
  return {
    current: values[values.length - 1],
    min: statsMin(values),
    max: statsMax(values),
    mad: mad(values),
  };
};

export const usePhysioStream = (): UsePhysioStreamReturn => {
  const [socketState, setSocketState] = useState<SocketState>("idle");
  const [buffers, setBuffers] = useState<Record<string, number[]>>(createEmptyBuffers());
  const [sessionData, setSessionData] = useState<SensorFrame["values"][]>([]);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [aggregatedFeatures, setAggregatedFeatures] = useState<InferenceFeatures | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const buffersRef = useRef(buffers);
  const sessionDataRef = useRef<SensorFrame["values"][]>([]);

  useEffect(() => {
    buffersRef.current = buffers;
  }, [buffers]);

  useEffect(() => {
    sessionDataRef.current = sessionData;
  }, [sessionData]);

  const computeLiveMetrics = useCallback(() => {
    const currentBuffers = buffersRef.current;
    const currentSessionData = sessionDataRef.current;

    const steps = currentSessionData.map((v) => v.steps_delta);
    const calories = currentSessionData.map((v) => v.calories_delta);
    const scrPeaks = currentSessionData.map((v) => v.eda_scr_peak);

    setSessionMetrics({
      heartRate: computeMetricStats(currentBuffers.heartRate),
      rmssd: computeMetricStats(currentBuffers.rmssd),
      sdnn: computeMetricStats(currentBuffers.sdnn),
      lfHfRatio: computeMetricStats(currentBuffers.lfHfRatio),
      activityLevel: computeMetricStats(currentBuffers.activityLevel),
      temperature: computeMetricStats(currentBuffers.temperature),
      edaScl: computeMetricStats(currentBuffers.edaScl),
      edaScrAmp: computeMetricStats(currentBuffers.edaScrAmp),
      respRate: computeMetricStats(currentBuffers.respRate),
      totalSteps: sum(steps),
      totalCalories: sum(calories),
      scrCount: scrPeaks.filter(Boolean).length,
      duration: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
      sampleCount: currentSessionData.length,
    });
  }, []);

  const handleFrame = useCallback(
    (frame: SensorFrame) => {
      const { values } = frame;

      setBuffers((prev) => ({
        heartRate: [...prev.heartRate, values.heart_rate].slice(-BUFFER_SIZE),
        rmssd: [...prev.rmssd, values.rmssd].slice(-BUFFER_SIZE),
        sdnn: [...prev.sdnn, values.sdnn].slice(-BUFFER_SIZE),
        lfHfRatio: [...prev.lfHfRatio, values.lf_hf_ratio].slice(-BUFFER_SIZE),
        activityLevel: [...prev.activityLevel, values.activity_level].slice(-BUFFER_SIZE),
        temperature: [...prev.temperature, values.temperature].slice(-BUFFER_SIZE),
        edaScl: [...prev.edaScl, values.eda_scl].slice(-BUFFER_SIZE),
        edaScrAmp: [...prev.edaScrAmp, values.eda_scr_amp].slice(-BUFFER_SIZE),
        respRate: [...prev.respRate, values.resp_rate].slice(-BUFFER_SIZE),
      }));

      setSessionData((prev) => {
        const newData = [...prev, values];
        setTimeout(computeLiveMetrics, 0);
        return newData;
      });
    },
    [computeLiveMetrics]
  );

  const startListening = useCallback(() => {
      startTimeRef.current = Date.now();
      setBuffers(createEmptyBuffers());
      setSessionData([]);
      setSessionMetrics(null);
      setAggregatedFeatures(null);

      streamSocket.connect(
        1000,
        handleFrame,
        setSocketState,
        (error) => {
          console.error("Stream error:", error);
          setSocketState("error");
        }
      );
    },
    [handleFrame]
  );

  const stopListening = useCallback(() => {
    streamSocket.disconnect();
    setSocketState("ended");

    const frames = sessionData.map(
      (values): SensorFrame => ({
        type: "sensor_frame",
        session_id: "",
        seq: 0,
        mode: "calm",
        timestamp: "",
        values,
      })
    );

    if (frames.length > 0) {
      const totals = getSessionTotals(frames);
      const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

      setSessionMetrics((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          totalSteps: totals.totalSteps,
          totalCalories: totals.totalCalories,
          scrCount: totals.scrCount,
          duration,
          sampleCount: frames.length,
        };
      });

      const features = aggregateSession(frames);
      setAggregatedFeatures(features);
    }
  }, [sessionData]);

  const resetSession = useCallback(() => {
    streamSocket.disconnect();
    setSocketState("idle");
    setBuffers(createEmptyBuffers());
    setSessionData([]);
    setSessionMetrics(null);
    setAggregatedFeatures(null);
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      streamSocket.disconnect();
    };
  }, []);

  return {
    socketState,
    sessionMetrics,
    buffers,
    startListening,
    stopListening,
    resetSession,
    aggregatedFeatures,
    sessionData,
    sampleCount: sessionData.length,
  };
};

export const MIN_SAMPLES = MIN_SAMPLES_FOR_INFERENCE;
