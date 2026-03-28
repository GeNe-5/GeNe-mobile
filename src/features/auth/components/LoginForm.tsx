import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AccessibilityInfo, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { handleApiError } from "../../../common/utils/response";
import { notifyError, notifySuccess } from "../../../common/utils/notify";
import { MOCK_LOGIN_CREDENTIALS } from "../../../common/data/mockData";
import { useLoginUser } from "../auth.hook";
import { loginSchema, type LoginInput } from "../auth.schema";
import { useAuthStore } from "../auth.store";
import { FormInput } from "./FormInput";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

type LoginFormProps = {
  onSwitchToSignup: () => void;
};

export const LoginForm = ({ onSwitchToSignup }: LoginFormProps) => {
  const loginMutation = useLoginUser();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: MOCK_LOGIN_CREDENTIALS.email,
      password: MOCK_LOGIN_CREDENTIALS.password,
    },
  });

  const onSubmit = async (payload: LoginInput) => {
    try {
      const response = await loginMutation.mutateAsync(payload);
      setAccessToken(response.data.accessToken);
      notifySuccess("Login successful");
    } catch (error) {
      notifyError(handleApiError(error));
    }
  };

  useEffect(() => {
    if (isSubmitting || loginMutation.isPending) {
      void AccessibilityInfo.announceForAccessibility("Logging in. Please wait.");
    }
  }, [isSubmitting, loginMutation.isPending]);

  return (
    <View
      style={styles.wrap}
      accessible={true}
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
    >
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
        placeholder="Your password"
        secureTextEntry
      />
      <PrimaryButton
        title={isSubmitting || loginMutation.isPending ? "Logging In..." : "Log In"}
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting || loginMutation.isPending}
        disabled={isSubmitting || loginMutation.isPending}
        accessibilityLabel="Login button"
        accessibilityHint="Tap to log into your account"
      />
      <TouchableOpacity
        onPress={onSwitchToSignup}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Sign up instead"
        accessibilityHint="Opens account registration form"
        accessibilityState={{ disabled: false }}
      >
        <Text style={styles.switchText} allowFontScaling={true}>
          No account yet? Sign up
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
