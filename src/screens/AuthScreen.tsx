import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { LoginForm } from "../features/auth/components/LoginForm";
import { SignupForm } from "../features/auth/components/SignupForm";
import { MOCK_LOGIN_CREDENTIALS } from "../common/data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export const AuthScreen = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <Screen>
      <View
        style={styles.headerWrap}
        accessible={true}
        accessibilityElementsHidden={false}
        importantForAccessibility="yes"
      >
        <Text style={styles.title} accessibilityRole="header" allowFontScaling={true}>
          Music Therapy
        </Text>
        <Text style={styles.subtitle} accessibilityRole="text" allowFontScaling={true}>
          Login to access your calming dashboard
        </Text>
        <Text style={styles.hint} accessibilityRole="text" allowFontScaling={true}>
          Use {MOCK_LOGIN_CREDENTIALS.email} / {MOCK_LOGIN_CREDENTIALS.password}
        </Text>
      </View>

      {mode === "login" ? (
        <LoginForm onSwitchToSignup={() => setMode("signup")} />
      ) : (
        <SignupForm onSwitchToLogin={() => setMode("login")} />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 24,
  },
  hint: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
});
