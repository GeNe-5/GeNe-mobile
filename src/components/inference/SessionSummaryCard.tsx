import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { SessionMetrics } from "../../types/stream";

interface SessionSummaryCardProps {
  metrics: SessionMetrics | null;
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
};

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Session Overview</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Start a session to see metrics</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Overview</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatDuration(metrics.duration)}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Samples</Text>
          <Text style={styles.statValue}>{metrics.sampleCount}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Steps</Text>
          <Text style={styles.statValue}>{metrics.totalSteps.toFixed(0)}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Calories</Text>
          <Text style={styles.statValue}>{metrics.totalCalories.toFixed(1)}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SCR Count</Text>
          <Text style={styles.statValue}>{metrics.scrCount}</Text>
        </View>
      </View>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statItem: {
    minWidth: "45%",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
