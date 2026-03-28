import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { LANDING_HIGHLIGHTS, LANDING_STATS } from "../common/data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type LandingScreenProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

export const LandingScreen = ({ onGetStarted, onSignIn }: LandingScreenProps) => {
  return (
    <Screen>
      <View style={styles.heroWrap} accessible={true}>
        <Text style={styles.badge} accessibilityRole="text" allowFontScaling={true}>
          MindTune
        </Text>
        <Text style={styles.title} accessibilityRole="header" allowFontScaling={true}>
          Music That Matches Your Mind
        </Text>
        <Text style={styles.subtitle} accessibilityRole="text" allowFontScaling={true}>
          Personalized calm audio, tiny check-ins, and clear trend insights.
          Start with dummy data and shape it into your real app later.
        </Text>
      </View>

      <View style={styles.statsRow}>
        {LANDING_STATS.map((item) => (
          <View key={item.id} style={styles.statCard} accessible={true}>
            <Text style={styles.statValue} allowFontScaling={true}>
              {item.value}
            </Text>
            <Text style={styles.statLabel} allowFontScaling={true}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.highlightWrap}>
        {LANDING_HIGHLIGHTS.map((text) => (
          <Text key={text} style={styles.highlightItem} allowFontScaling={true}>
            • {text}
          </Text>
        ))}
      </View>

      <View style={styles.actionsWrap}>
        <PrimaryButton
          title="Explore Overview"
          onPress={onGetStarted}
          accessibilityLabel="Explore overview"
          accessibilityHint="Opens project overview details"
        />
        <TouchableOpacity
          onPress={onSignIn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Jump to insights"
          accessibilityHint="Opens sign in flow"
        >
          <Text style={styles.signInText} allowFontScaling={true}>
            Jump to Insights
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  heroWrap: {
    gap: spacing.sm,
  },
  badge: {
    color: colors.accent,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontSize: 13,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 27,
  },
  actionsWrap: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    minWidth: "47%",
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F4FAFF",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  highlightWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FCFF",
    padding: spacing.sm,
    gap: spacing.xs,
  },
  highlightItem: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
  },
  signInText: {
    textAlign: "center",
    color: colors.accent,
    fontWeight: "600",
    fontSize: 15,
  },
});
