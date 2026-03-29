import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { InferenceFeatures } from "../../types/inference";

interface FeatureSummaryCardProps {
  features: InferenceFeatures | null;
}

const formatValue = (val: number): string => {
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(2);
};

const FEATURE_GROUPS = [
  {
    title: "Heart Rate",
    fields: [
      { key: "hr_mean", label: "HR Mean" },
      { key: "hr_std", label: "HR Std" },
      { key: "hr_min", label: "HR Min" },
      { key: "hr_max", label: "HR Max" },
    ],
  },
  {
    title: "RMSSD",
    fields: [
      { key: "rmssd_mean", label: "RMSSD Mean" },
      { key: "rmssd_std", label: "RMSSD Std" },
      { key: "rmssd_min", label: "RMSSD Min" },
      { key: "rmssd_max", label: "RMSSD Max" },
    ],
  },
  {
    title: "SDNN",
    fields: [
      { key: "sdnn_mean", label: "SDNN Mean" },
      { key: "sdnn_std", label: "SDNN Std" },
    ],
  },
  {
    title: "Frequency",
    fields: [{ key: "lf_hf_ratio", label: "LF/HF Ratio" }],
  },
  {
    title: "Activity",
    fields: [
      { key: "activity_steps", label: "Steps" },
      { key: "activity_calories", label: "Calories" },
      { key: "activity_level", label: "Level" },
    ],
  },
  {
    title: "Temperature",
    fields: [
      { key: "temp_mean", label: "Temp Mean" },
      { key: "temp_std", label: "Temp Std" },
      { key: "temp_range", label: "Temp Range" },
    ],
  },
  {
    title: "EDA",
    fields: [
      { key: "eda_scl_mean", label: "SCL Mean" },
      { key: "eda_scl_std", label: "SCL Std" },
      { key: "eda_scr_count", label: "SCR Count" },
      { key: "eda_scr_amp_mean", label: "SCR Amp Mean" },
    ],
  },
  {
    title: "Respiration",
    fields: [
      { key: "resp_rate", label: "Rate" },
      { key: "resp_var", label: "Variability" },
    ],
  },
];

export const FeatureSummaryCard: React.FC<FeatureSummaryCardProps> = ({ features }) => {
  if (!features) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Computed Features</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>End session to see computed features</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Computed Features (23)</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.groupsContainer}>
          {FEATURE_GROUPS.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.fields.map((field) => (
                <View key={field.key} style={styles.featureRow}>
                  <Text style={styles.featureLabel}>{field.label}</Text>
                  <Text style={styles.featureValue}>
                    {formatValue(features[field.key as keyof InferenceFeatures])}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
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
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  groupsContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  group: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    minWidth: 100,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  featureLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  featureValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: "500",
  },
});
