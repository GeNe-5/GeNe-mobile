import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type AboutScreenProps = {
  onBack: () => void;
};

export const AboutScreen = ({ onBack }: AboutScreenProps) => {
  return (
    <Screen>
      <View style={styles.wrap} accessible={true}>
        <Text style={styles.title} accessibilityRole="header" allowFontScaling={true}>
          Basic Running Project
        </Text>
        <Text style={styles.item} allowFontScaling={true}>
          - Expo + TypeScript configured
        </Text>
        <Text style={styles.item} allowFontScaling={true}>
          - Organized src scaffolding
        </Text>
        <Text style={styles.item} allowFontScaling={true}>
          - Reusable UI components
        </Text>
        <Text style={styles.item} allowFontScaling={true}>
          - Starter screen flow
        </Text>
      </View>
      <PrimaryButton
        title="Back"
        onPress={onBack}
        accessibilityLabel="Back"
        accessibilityHint="Returns to previous screen"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  item: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
});
