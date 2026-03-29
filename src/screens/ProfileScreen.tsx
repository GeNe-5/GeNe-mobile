import { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import { authApi } from "../api/auth";
import { useAuthStore } from "../features/auth/auth.store";
import { notifyError, notifySuccess } from "../common/utils/notify";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export const ProfileScreen = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isEditingBirthdate, setIsEditingBirthdate] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [birthdate, setBirthdate] = useState("");
  const [weight, setWeight] = useState("");

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setBirthdate(profile.birthdate || "");
      setWeight(profile.weight?.toString() || "");
    }
  }, [profile]);

  const updateBirthdateMutation = useMutation({
    mutationFn: async (birthdate: string) => {
      if (!user?.id) throw new Error("User not found");
      return userApi.updateBirthdate(user.id, { birthdate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      notifySuccess("Birthdate updated successfully");
      setIsEditingBirthdate(false);
    },
    onError: (error: Error) => {
      notifyError(error.message);
    },
  });

  const updateWeightMutation = useMutation({
    mutationFn: async (weightStr: string) => {
      if (!user?.id) throw new Error("User not found");
      const weightNum = Number(weightStr);
      if (isNaN(weightNum) || weightNum <= 0) {
        throw new Error("Please enter a valid positive number");
      }
      return userApi.updateWeight(user.id, { weight: weightNum });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      notifySuccess("Weight updated successfully");
      setIsEditingWeight(false);
    },
    onError: (error: Error) => {
      notifyError(error.message);
    },
  });

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <PrimaryButton title="Retry" onPress={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{profile.age ?? "Not set"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Birthdate</Text>
            {isEditingBirthdate ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={birthdate}
                  onChangeText={setBirthdate}
                  placeholderTextColor={colors.textSecondary}
                />
                <Pressable 
                  style={styles.saveButton} 
                  onPress={() => updateBirthdateMutation.mutate(birthdate)}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={() => setIsEditingBirthdate(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.editRow}>
                <Text style={styles.value}>{profile.birthdate ?? "Not set"}</Text>
                <Pressable onPress={() => setIsEditingBirthdate(true)}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Weight (kg)</Text>
            {isEditingWeight ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Weight in kg"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
                <Pressable 
                  style={styles.saveButton} 
                  onPress={() => updateWeightMutation.mutate(weight)}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={() => setIsEditingWeight(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.editRow}>
                <Text style={styles.value}>{profile.weight ?? "Not set"}</Text>
                <Pressable onPress={() => setIsEditingWeight(true)}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editText: {
    color: colors.accent,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.xs,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
