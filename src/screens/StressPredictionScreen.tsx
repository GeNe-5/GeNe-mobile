import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { useMutation } from "@tanstack/react-query";
import { inferenceApi } from "../api/inference";
import { musicApi } from "../api/music";
import { usePhysioStream, MIN_SAMPLES } from "../hooks/usePhysioStream";
import { LiveMetricChart } from "../components/inference/LiveMetricChart";
import { SessionSummaryCard } from "../components/inference/SessionSummaryCard";
import { FeatureSummaryCard } from "../components/inference/FeatureSummaryCard";
import { PredictionResultCard } from "../components/inference/PredictionResultCard";
import { SocketState } from "../types/stream";
import { InferenceResponse } from "../types/inference";
import { MusicTrack } from "../types/music";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import {
  getStressLevelLabel,
  normalizeStressLevel,
  type StressLevelKey,
} from "../utils/stressLevel";

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

const formatDuration = (durationSec: number): string => {
  if (!durationSec || durationSec <= 0) {
    return "--:--";
  }
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const StressPredictionScreen: React.FC = () => {
  const [predictionResult, setPredictionResult] =
    useState<InferenceResponse | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [recommendedTracks, setRecommendedTracks] = useState<MusicTrack[]>([]);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicStressLevel, setMusicStressLevel] =
    useState<StressLevelKey | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);

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

  const releaseSound = useCallback(async () => {
    if (!soundRef.current) {
      loadedTrackIdRef.current = null;
      return;
    }

    soundRef.current.setOnPlaybackStatusUpdate(null);
    await soundRef.current.unloadAsync();
    soundRef.current = null;
    loadedTrackIdRef.current = null;
  }, []);

  const resetMusic = useCallback(async () => {
    await releaseSound();
    setRecommendedTracks([]);
    setMusicError(null);
    setMusicStressLevel(null);
    setActiveTrackId(null);
    setIsTrackPlaying(false);
  }, [releaseSound]);

  const loadRecommendedMusic = useCallback(async (level: StressLevelKey) => {
    setMusicLoading(true);
    setMusicError(null);
    setMusicStressLevel(level);

    try {
      const tracks = await musicApi.getTracksForStressLevel(level, 2);
      setRecommendedTracks(tracks);
      setActiveTrackId(null);
      setIsTrackPlaying(false);

      if (tracks.length === 0) {
        setMusicError("No playable tracks found for this stress level.");
      }
    } catch (error) {
      setRecommendedTracks([]);
      setMusicError(
        error instanceof Error
          ? error.message
          : "Unable to load music recommendations."
      );
    } finally {
      setMusicLoading(false);
    }
  }, []);

  const handleTrackPress = useCallback(
    async (track: MusicTrack) => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        setActiveTrackId(track.id);

        if (soundRef.current && loadedTrackIdRef.current === track.id) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsTrackPlaying(false);
          } else if (status.isLoaded) {
            await soundRef.current.playAsync();
            setIsTrackPlaying(true);
          }
          return;
        }

        await releaseSound();

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.previewUrl },
          { shouldPlay: true, isLooping: false, progressUpdateIntervalMillis: 500 }
        );

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded) {
            return;
          }

          setIsTrackPlaying(status.isPlaying);

          if (status.didJustFinish) {
            setIsTrackPlaying(false);
          }
        });

        soundRef.current = sound;
        loadedTrackIdRef.current = track.id;
        setIsTrackPlaying(true);
      } catch {
        setMusicError("Unable to play this track right now.");
        setIsTrackPlaying(false);
      }
    },
    [releaseSound]
  );

  useEffect(() => {
    return () => {
      void releaseSound();
    };
  }, [releaseSound]);

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

      const resolvedStressLevel = normalizeStressLevel(
        data.stress_level ?? data.severity_level
      );

      void releaseSound();
      setActiveTrackId(null);
      setIsTrackPlaying(false);

      if (!resolvedStressLevel) {
        setRecommendedTracks([]);
        setMusicStressLevel(null);
        setMusicError("Stress level unavailable for music recommendation.");
        return;
      }

      void loadRecommendedMusic(resolvedStressLevel);
    },
    onError: (error: Error) => {
      setPredictionError(error.message || "Prediction failed");
      setPredictionResult(null);
    },
  });

  const handleListen = () => {
    setPredictionResult(null);
    setPredictionError(null);
    void resetMusic();
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
    void resetMusic();
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

        {(musicLoading || musicError || recommendedTracks.length > 0) && (
          <View style={styles.musicSection}>
            <Text style={styles.musicTitle}>Recommended Music</Text>
            {musicStressLevel && (
              <Text style={styles.musicSubtitle}>
                For {getStressLevelLabel(musicStressLevel)}
              </Text>
            )}

            {musicLoading && (
              <View style={styles.musicLoadingRow}>
                <ActivityIndicator color={colors.accent} size="small" />
                <Text style={styles.musicLoadingText}>Fetching tracks...</Text>
              </View>
            )}

            {musicError && <Text style={styles.musicErrorText}>{musicError}</Text>}

            {recommendedTracks.map((track) => {
              const isActive = activeTrackId === track.id;
              const actionLabel =
                isActive && isTrackPlaying ? "Pause" : "Play";

              return (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackRow}
                  onPress={() => {
                    void handleTrackPress(track);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.trackMeta}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {track.artist} • {formatDuration(track.durationSec)}
                    </Text>
                  </View>
                  <View style={[styles.trackAction, isActive && styles.trackActionActive]}>
                    <Text
                      style={[
                        styles.trackActionText,
                        isActive && styles.trackActionTextActive,
                      ]}
                    >
                      {actionLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
  musicSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  musicTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  musicSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -2,
  },
  musicLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  musicLoadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  musicErrorText: {
    fontSize: 13,
    color: "#D9534F",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  trackMeta: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  trackArtist: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackAction: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  trackActionActive: {
    backgroundColor: colors.accent,
  },
  trackActionText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "700",
  },
  trackActionTextActive: {
    color: colors.surface,
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
