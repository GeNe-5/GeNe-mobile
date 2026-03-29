import { useState } from "react";
import { StyleSheet, Text, TextInput, View, Alert, ActivityIndicator } from "react-native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { useMutation } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";
import { notifyError, notifySuccess } from "../common/utils/notify";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export const ReportScreen = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const data = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };
      return reportsApi.generateReport(data);
    },
    onSuccess: (filePath) => {
      setGeneratedPath(filePath);
      notifySuccess("Report generated successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("404") || error.message.includes("no inference records")) {
        notifyError("No inference records found for the selected date range.");
      } else {
        notifyError(error.message);
      }
    },
  });

  const openMutation = useMutation({
    mutationFn: async () => {
      if (!generatedPath) throw new Error("No report generated");
      return reportsApi.openReport(generatedPath);
    },
    onError: (error: Error) => {
      notifyError(error.message);
    },
  });

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Generate Report</Text>
        <Text style={styles.subtitle}>
          Create a PDF report of your stress predictions
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Start Date (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.hint}>Leave empty for all records</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>End Date (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.hint}>Leave empty for all records</Text>
          </View>
        </View>

        {generateMutation.isPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Generating report...</Text>
          </View>
        ) : (
          <View style={styles.actions}>
            <PrimaryButton
              title="Generate PDF Report"
              onPress={() => generateMutation.mutate()}
            />
            
            {generatedPath && (
              <PrimaryButton
                title={openMutation.isPending ? "Opening..." : "Open/Share Report"}
                onPress={() => openMutation.mutate()}
                isLoading={openMutation.isPending}
              />
            )}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Reports</Text>
          <Text style={styles.infoText}>
            The PDF report contains a summary of your stress predictions, including:
          </Text>
          <Text style={styles.infoItem}>• Prediction history</Text>
          <Text style={styles.infoItem}>• Stress/Non-stress distribution</Text>
          <Text style={styles.infoItem}>• Confidence statistics</Text>
          <Text style={styles.infoItem}>• Date-wise breakdown</Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: "#F8FCFF",
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});
