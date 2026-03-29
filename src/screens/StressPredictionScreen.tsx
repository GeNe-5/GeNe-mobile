import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { useMutation } from "@tanstack/react-query";
import { inferenceApi } from "../api/inference";
import { usePhysioStream, MIN_SAMPLES } from "../hooks/usePhysioStream";
import { LiveMetricChart } from "../components/inference/LiveMetricChart";
import { SessionSummaryCard } from "../components/inference/SessionSummaryCard";
import { FeatureSummaryCard } from "../components/inference/FeatureSummaryCard";
import { PredictionResultCard } from "../components/inference/PredictionResultCard";
import { SocketState } from "../types/stream";
import { InferenceResponse } from "../types/inference";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const getSocketStateLabel = (state: SocketState): string => {
  switch (state) {
    case "idle":
      return "Idle";
    case "connecting":
      return "Connecting...";
    case "listening":
      return "Listening";
    case "ended":
      return "Session Ended";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
};

const getSocketStateColor = (state: SocketState): string => {
  switch (state) {
    case "idle":
      return colors.textSecondary;
    case "connecting":
      return "#F59E0B";
    case "listening":
      return "#10B981";
    case "ended":
      return "#6B7280";
    case "error":
      return "#EF4444";
    default:
      return colors.textSecondary;
  }
};

interface ToggleButtonProps {
  socketState: SocketState;
  onListen: () => void;
  onStop: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  socketState,
  onListen,
  onStop,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isListening =
    socketState === "listening" || socketState === "connecting";

  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  if (socketState === "idle" || socketState === "error") {
    return (
      <TouchableOpacity
        style={[styles.listenButton, { backgroundColor: "#10B981" }]}
        onPress={onListen}
        activeOpacity={0.8}
      >
        <Text style={styles.listenButtonText}>Listen</Text>
      </TouchableOpacity>
    );
  }

  if (socketState === "ended") {
    return (
      <View style={[styles.listenButton, { backgroundColor: "#6B7280" }]}>
        <Text style={styles.listenButtonText}>Stopped</Text>
      </View>
    );
  }

  if (socketState === "connecting") {
    return (
      <Animated.View style={{ opacity: pulseAnim }}>
        <TouchableOpacity
          style={[styles.listenButton, { backgroundColor: "#F59E0B" }]}
          activeOpacity={0.8}
          disabled
        >
          <ActivityIndicator color="#FFFFFF" size="small" />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: isListening ? pulseAnim : 1 }}>
      <TouchableOpacity
        style={[styles.listenButton, { backgroundColor: "#EF4444" }]}
        onPress={onStop}
        activeOpacity={0.8}
      >
        <Text style={styles.listenButtonText}>Stop</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const METRICS = [
  { key: "heartRate", label: "Heart Rate", unit: "bpm" },
  { key: "rmssd", label: "RMSSD", unit: "ms" },
  { key: "sdnn", label: "SDNN", unit: "ms" },
  { key: "lfHfRatio", label: "LF/HF Ratio", unit: "" },
  { key: "activityLevel", label: "Activity Level", unit: "" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "edaScl", label: "EDA SCL", unit: "μS" },
  { key: "edaScrAmp", label: "EDA SCR Amp", unit: "μS" },
  { key: "respRate", label: "Resp Rate", unit: "/min" },
] as const;

export const StressPredictionScreen: React.FC = () => {
  const [predictionResult, setPredictionResult] =
    useState<InferenceResponse | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const {
    socketState,
    sessionMetrics,
    buffers,
    startListening,
    stopListening,
    resetSession,
    aggregatedFeatures,
    sampleCount,
  } = usePhysioStream();

  const predictionMutation = useMutation({
    mutationFn: async () => {
      if (!aggregatedFeatures) {
        throw new Error("No aggregated features available");
      }
      // const payload = {
      //   features: aggregatedFeatures,
      //   threshold: 0.5,
      // };
      return inferenceApi.predict(aggregatedFeatures);
    },
    onSuccess: (data) => {
      setPredictionResult(data);
      setPredictionError(null);
    },
    onError: (error: Error) => {
      setPredictionError(error.message || "Prediction failed");
      setPredictionResult(null);
    },
  });

  const handleListen = () => {
    setPredictionResult(null);
    setPredictionError(null);
    startListening();
  };

  const handleStop = () => {
    stopListening();
  };

  const handleSubmit = () => {
    setPredictionError(null);
    predictionMutation.mutate();
  };

  const handleReset = () => {
    resetSession();
    setPredictionResult(null);
    setPredictionError(null);
  };

  const isListening =
    socketState === "listening" || socketState === "connecting";
  const hasEnded = socketState === "ended";
  const hasEnoughSamples = sampleCount >= MIN_SAMPLES;
  const canSubmit = hasEnded && hasEnoughSamples && aggregatedFeatures;

  const getMetricValue = (key: string) => {
    if (!sessionMetrics) return { current: 0, min: 0, mad: 0 };
    const metric = sessionMetrics[key as keyof typeof sessionMetrics];
    if (!metric) return { current: 0, min: 0, mad: 0 };
    return {
      current: (metric as { current: number }).current,
      min: (metric as { min: number }).min,
      mad: (metric as { mad: number }).mad,
    };
  };

  const getBufferValues = (key: string): number[] => {
    return buffers[key as keyof typeof buffers] || [];
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Stress Prediction</Text>
        <Text style={styles.subtitle}>
          Stream live physiological data to predict stress levels
        </Text>

        <View style={styles.controls}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getSocketStateColor(socketState) },
              ]}
            />
            <Text style={styles.statusText}>
              {getSocketStateLabel(socketState)}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <ToggleButton
              socketState={socketState}
              onListen={handleListen}
              onStop={handleStop}
            />
          </View>
        </View>

        <SessionSummaryCard metrics={sessionMetrics} />

        {isListening && (
          <>
            <Text style={styles.sectionTitle}>Live Metrics</Text>
            <View style={styles.chartsColumn}>
              {METRICS.map((metric) => {
                const values = getMetricValue(metric.key);
                const buffer = getBufferValues(metric.key);
                return (
                  <View key={metric.key} style={styles.chartCardWrapper}>
                    <LiveMetricChart
                      label={metric.label}
                      unit={metric.unit}
                      values={buffer}
                      current={values.current}
                      min={values.min}
                      mad={values.mad}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        {hasEnded && (
          <>
            {!hasEnoughSamples && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Insufficient data for prediction. Need at least {MIN_SAMPLES}{" "}
                  samples, got {sampleCount}.
                </Text>
              </View>
            )}

            <FeatureSummaryCard features={aggregatedFeatures} />

            <View style={styles.actionRow}>
              <PrimaryButton
                title="Get Prediction"
                onPress={handleSubmit}
                isLoading={predictionMutation.isPending}
                disabled={!canSubmit}
              />
            </View>
          </>
        )}

        <PredictionResultCard
          result={predictionResult}
          isLoading={predictionMutation.isPending}
          error={predictionError}
        />

        <TouchableOpacity style={styles.resetSection} onPress={handleReset}>
          <Text style={styles.resetText}>Reset Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  modeSelector: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  modeButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  modeButtonTextSelected: {
    color: colors.surface,
  },
  controls: {
    gap: spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  listenButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    minWidth: 180,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  listenButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chartsColumn: {
    gap: spacing.sm,
  },
  chartCardWrapper: {
    width: "100%",
  },
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: spacing.md,
  },
  warningText: {
    color: "#92400E",
    fontSize: 14,
    textAlign: "center",
  },
  actionRow: {
    marginTop: spacing.md,
  },
  resetSection: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  resetText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: "600",
  },
});
