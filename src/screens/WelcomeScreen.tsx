import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type WelcomeScreenProps = {
  onContinue: () => void;
};

export const WelcomeScreen = ({ onContinue }: WelcomeScreenProps) => {
  return (
    <Screen>
      <View style={styles.headerWrap} accessible={true}>
        <Text style={styles.badge} allowFontScaling={true}>
          GeNe Mobile
        </Text>
        <Text style={styles.title} accessibilityRole="header" allowFontScaling={true}>
          Starter Project Ready
        </Text>
        <Text style={styles.subtitle} accessibilityRole="text" allowFontScaling={true}>
          Your React Native scaffold is set up with a clean structure for screens,
          components, and theme.
        </Text>
      </View>
      <PrimaryButton
        title="View Project Info"
        onPress={onContinue}
        accessibilityLabel="View project information"
        accessibilityHint="Opens project details"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    gap: spacing.sm,
  },
  badge: {
    color: colors.accent,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
});
