import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { InferenceResponse } from "../../types/inference";
import {
  getStressLevelLabel,
  normalizeStressLevel,
  STRESS_LEVEL_COLORS,
} from "../../utils/stressLevel";

interface PredictionResultCardProps {
  result: InferenceResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Prediction Result</Text>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Analyzing session data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Prediction Result</Text>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Prediction Result</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Submit session for prediction</Text>
        </View>
      </View>
    );
  }

  const isStress = result.prediction === 1;
  const severityLevel = normalizeStressLevel(
    result.stress_level ?? result.severity_level
  );
  const severityScore = result.severity_score ?? null;
  const hasSeverity =
    severityLevel !== null || typeof severityScore === "number";
  const severityLabel = severityLevel
    ? getStressLevelLabel(severityLevel)
    : "Unavailable";
  const severityPercent =
    typeof severityScore === "number"
      ? Math.round(severityScore * 1000) / 10
      : null;
  const severityColor = severityLevel
    ? STRESS_LEVEL_COLORS[severityLevel] ?? colors.textSecondary
    : colors.textSecondary;
  const severityComponents = result.severity_components ?? null;
  const inputSummary = result.input_summary ?? null;
  const components = severityComponents
    ? buildSeverityComponents(severityComponents)
    : [];
  const summaryItems = inputSummary ? buildInputSummary(inputSummary) : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prediction Result</Text>

      <View style={styles.mainResult}>
        <Text style={styles.sectionHeader}>Binary Result</Text>
        <View
          style={[
            styles.resultBadge,
            isStress ? styles.stressBadge : styles.nonStressBadge,
          ]}
        >
          <Text
            style={[
              styles.resultLabel,
              isStress ? styles.stressText : styles.nonStressText,
            ]}
          >
            {isStress ? "Stress" : "Non-Stress"}
          </Text>
        </View>

        <Text style={styles.confidence}>
          Confidence: {(result.confidence * 100).toFixed(1)}%
        </Text>
      </View>

      {hasSeverity && (
        <View style={styles.severitySection}>
          <View style={styles.severityHeaderRow}>
            <Text style={styles.sectionHeader}>Severity</Text>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: `${severityColor}22` },
              ]}
            >
              <Text style={[styles.severityBadgeText, { color: severityColor }]}>
                {severityLabel}
              </Text>
            </View>
          </View>
          <Text style={styles.severityScoreText}>
            Score: {severityPercent !== null ? `${severityPercent}%` : "N/A"}
          </Text>
          {severityPercent !== null && (
            <View style={styles.severityBarTrack}>
              <View
                style={[
                  styles.severityBarFill,
                  {
                    width: `${Math.min(Math.max(severityPercent, 0), 100)}%`,
                    backgroundColor: severityColor,
                  },
                ]}
              />
            </View>
          )}
        </View>
      )}

      <View style={styles.probabilitySection}>
        <Text style={styles.probabilityTitle}>Probability</Text>
        <View style={styles.probabilityRow}>
          <View style={styles.probabilityItem}>
            <Text style={styles.probabilityLabel}>Non-Stress</Text>
            <Text style={[styles.probabilityValue, styles.nonStressText]}>
              {(result.probability.non_stress * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.probabilityItem}>
            <Text style={styles.probabilityLabel}>Stress</Text>
            <Text style={[styles.probabilityValue, styles.stressText]}>
              {(result.probability.stress * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {components.length > 0 && (
        <View style={styles.contributorsSection}>
          <Text style={styles.sectionHeader}>Stress Drivers</Text>
          <View style={styles.contributorsGrid}>
            {components.map((component) => (
              <View key={component.key} style={styles.contributorRow}>
                <Text style={styles.contributorLabel}>{component.label}</Text>
                <View style={styles.contributorBarTrack}>
                  <View
                    style={[
                      styles.contributorBarFill,
                      { width: `${component.percent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.contributorValue}>
                  {component.display}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {summaryItems.length > 0 && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionHeader}>Physiological Summary</Text>
          <View style={styles.summaryRow}>
            {summaryItems.map((item) => (
              <View key={item.key} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.modelInfo}>
        <Text style={styles.modelInfoText}>
          {result.model_name} v{result.model_version}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(result.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const buildSeverityComponents = (components: {
  hr_score?: number;
  rmssd_score?: number;
  sdnn_score?: number;
  lfhf_score?: number;
  eda_score?: number;
  resp_score?: number;
}) => {
  const items = [
    { key: "hr_score", label: "Heart Rate", value: components.hr_score },
    { key: "rmssd_score", label: "RMSSD", value: components.rmssd_score },
    { key: "sdnn_score", label: "SDNN", value: components.sdnn_score },
    { key: "lfhf_score", label: "LF/HF", value: components.lfhf_score },
    { key: "eda_score", label: "EDA", value: components.eda_score },
    { key: "resp_score", label: "Respiration", value: components.resp_score },
  ];

  return items
    .filter((item) => typeof item.value === "number")
    .map((item) => {
      const clamped = Math.min(Math.max(item.value as number, 0), 1);
      const percent = Math.round(clamped * 100);
      return {
        key: item.key,
        label: item.label,
        percent,
        display: `${percent}%`,
      };
    });
};

const buildInputSummary = (summary: {
  hr_mean?: number;
  rmssd_mean?: number;
  sdnn_mean?: number;
  lf_hf_ratio?: number;
}) => {
  const items = [
    {
      key: "hr_mean",
      label: "HR Mean",
      value: summary.hr_mean,
      unit: "bpm",
    },
    {
      key: "rmssd_mean",
      label: "RMSSD Mean",
      value: summary.rmssd_mean,
      unit: "ms",
    },
    {
      key: "sdnn_mean",
      label: "SDNN Mean",
      value: summary.sdnn_mean,
      unit: "ms",
    },
    {
      key: "lf_hf_ratio",
      label: "LF/HF Ratio",
      value: summary.lf_hf_ratio,
      unit: "",
    },
  ];

  return items
    .filter((item) => typeof item.value === "number")
    .map((item) => ({
      key: item.key,
      label: item.label,
      value: `${(item.value as number).toFixed(2)}${item.unit ? ` ${item.unit}` : ""}`,
    }));
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loadingState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  loadingText: {
    color: colors.accent,
    fontSize: 14,
  },
  errorState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
  },
  errorText: {
    color: "#D9534F",
    fontSize: 14,
  },
  mainResult: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    marginBottom: spacing.sm,
  },
  stressBadge: {
    backgroundColor: "#FEE2E2",
  },
  nonStressBadge: {
    backgroundColor: "#DCFCE7",
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: "700",
  },
  stressText: {
    color: "#DC2626",
  },
  nonStressText: {
    color: "#16A34A",
  },
  confidence: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  probabilitySection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  severitySection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  severityHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  severityScoreText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  severityBarTrack: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  severityBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  probabilityTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  probabilityRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  probabilityItem: {
    alignItems: "center",
  },
  probabilityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  probabilityValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  contributorsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  contributorsGrid: {
    gap: spacing.sm,
  },
  contributorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  contributorLabel: {
    flex: 1.2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  contributorBarTrack: {
    flex: 2,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  contributorBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  contributorValue: {
    width: 48,
    textAlign: "right",
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryItem: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: "46%",
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  modelInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modelInfoText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
