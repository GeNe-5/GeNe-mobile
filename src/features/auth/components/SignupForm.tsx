import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AccessibilityInfo, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { handleApiError } from "../../../common/utils/response";
import { notifyError, notifySuccess } from "../../../common/utils/notify";
import { useRegisterUser } from "../auth.hook";
import { registerSchema, type RegisterInput } from "../auth.schema";
import { FormInput } from "./FormInput";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

type SignupFormProps = {
  onSwitchToLogin: () => void;
};

export const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const registerMutation = useRegisterUser();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (payload: RegisterInput) => {
    try {
      await registerMutation.mutateAsync(payload);
      notifySuccess("Registration successful. Please log in.");
      onSwitchToLogin();
    } catch (error) {
      notifyError(handleApiError(error));
    }
  };

  useEffect(() => {
    if (isSubmitting || registerMutation.isPending) {
      void AccessibilityInfo.announceForAccessibility("Creating account. Please wait.");
    }
  }, [isSubmitting, registerMutation.isPending]);

  return (
    <View
      style={styles.wrap}
      accessible={true}
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
    >
      <FormInput
        control={control}
        name="name"
        label="Name"
        placeholder="Your name"
        autoCapitalize="words"
      />
      <FormInput
        control={control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
      />
      <FormInput
        control={control}
        name="password"
        label="Password"
        placeholder="Create password"
        secureTextEntry
      />
      <PrimaryButton
        title={isSubmitting || registerMutation.isPending ? "Creating..." : "Sign Up"}
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting || registerMutation.isPending}
        disabled={isSubmitting || registerMutation.isPending}
        accessibilityLabel="Sign up button"
        accessibilityHint="Tap to create your account"
      />
      <TouchableOpacity
        onPress={onSwitchToLogin}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Back to login"
        accessibilityHint="Opens login form"
        accessibilityState={{ disabled: false }}
      >
        <Text style={styles.switchText} allowFontScaling={true}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  switchText: {
    textAlign: "center",
    color: colors.accent,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
});
