import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export const Screen = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaView
      style={styles.safeArea}
      accessible={true}
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner} accessible={true}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  inner: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: "#245a8f",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 4,
  },
});
