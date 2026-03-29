import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<"start" | "end" | null>(
    null
  );

  const parseIsoDate = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const parsed = new Date(year, month, day);

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return parsed;
  };

  const formatIsoDate = (value: Date): string => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openDatePicker = (field: "start" | "end") => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const pickerValue =
    activeDateField === "start"
      ? parseIsoDate(startDate) ?? new Date()
      : parseIsoDate(endDate) ?? new Date();

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate || !activeDateField) {
      return;
    }

    const formatted = formatIsoDate(selectedDate);
    if (activeDateField === "start") {
      setStartDate(formatted);
    } else {
      setEndDate(formatted);
    }
  };

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
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Select date"
                value={startDate}
                onChangeText={setStartDate}
                placeholderTextColor={colors.textSecondary}
              />
              <Pressable
                onPress={() => openDatePicker("start")}
                style={styles.calendarButton}
                accessibilityRole="button"
                accessibilityLabel="Open start date calendar"
                accessibilityHint="Opens calendar to pick start date"
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.hint}>Leave empty for all records</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>End Date (Optional)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Select date"
                value={endDate}
                onChangeText={setEndDate}
                placeholderTextColor={colors.textSecondary}
              />
              <Pressable
                onPress={() => openDatePicker("end")}
                style={styles.calendarButton}
                accessibilityRole="button"
                accessibilityLabel="Open end date calendar"
                accessibilityHint="Opens calendar to pick end date"
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.hint}>Leave empty for all records</Text>
          </View>
        </View>

        {showDatePicker ? (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={pickerValue}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
            {Platform.OS === "ios" ? (
              <View style={styles.datePickerActions}>
                <Pressable
                  style={styles.doneButton}
                  onPress={() => setShowDatePicker(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Done selecting date"
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

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
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: "#F8FCFF",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  calendarButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  datePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  datePickerActions: {
    alignItems: "flex-end",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  doneButton: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  doneButtonText: {
    color: colors.accent,
    fontWeight: "600",
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
