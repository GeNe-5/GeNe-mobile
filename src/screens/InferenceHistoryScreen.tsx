import { StyleSheet, Text, View, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { Screen } from "../components/Screen";
import { useQuery } from "@tanstack/react-query";
import { inferenceApi } from "../api/inference";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { InferenceRecord } from "../types/api";

const InferenceRecordItem = ({ record }: { record: InferenceRecord }) => {
  const isStress = record.label === "stress";
  
  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={[styles.statusBadge, isStress ? styles.stressBadge : styles.nonStressBadge]}>
          <Text style={[styles.statusText, isStress ? styles.stressText : styles.nonStressText]}>
            {isStress ? "Stress" : "Non-Stress"}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(record.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Confidence:</Text>
          <Text style={styles.detailValue}>{(record.confidence * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stress Prob:</Text>
          <Text style={styles.detailValue}>{(record.probability_stress * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Non-Stress Prob:</Text>
          <Text style={styles.detailValue}>{(record.probability_non_stress * 100).toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );
};

export const InferenceHistoryScreen = () => {
  const { data: records, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["inferenceHistory"],
    queryFn: () => inferenceApi.getHistory(100),
  });

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load history</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Inference History</Text>
        
        {records && records.length > 0 ? (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <InferenceRecordItem record={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.accent}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Records Yet</Text>
            <Text style={styles.emptyText}>
              Your stress prediction history will appear here after you make predictions.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    color: "#D9534F",
    fontSize: 16,
  },
  errorDetail: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  stressBadge: {
    backgroundColor: "#FFEAEA",
  },
  nonStressBadge: {
    backgroundColor: "#E8F5E9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stressText: {
    color: "#D9534F",
  },
  nonStressText: {
    color: "#5CB85C",
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recordDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
