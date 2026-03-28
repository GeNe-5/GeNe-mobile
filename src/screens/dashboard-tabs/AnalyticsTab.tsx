import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, G, Line, Polyline } from "react-native-svg";
import { colors } from "../../theme/colors";
import { styles } from "../dashboard.styles";
import type { AnalysisRange, ChartPoint, RangeData } from "./types";

type AnalyticsTabProps = {
  selectedRange: AnalysisRange;
  onSelectRange: (range: AnalysisRange) => void;
  current: RangeData;
  graphWidth: number;
  graphHeight: number;
  pointsText: string;
  chartPoints: ChartPoint[];
};

export const AnalyticsTab = ({
  selectedRange,
  onSelectRange,
  current,
  graphWidth,
  graphHeight,
  pointsText,
  chartPoints,
}: AnalyticsTabProps) => {
  const [activePointIndex, setActivePointIndex] = useState(
    Math.max(0, current.values.length - 1)
  );

  useEffect(() => {
    setActivePointIndex(Math.max(0, current.values.length - 1));
  }, [selectedRange, current.values.length]);

  const activeValue = current.values[activePointIndex] ?? current.values[0] ?? 0;
  const activeLabel =
    current.labels[activePointIndex] ?? current.labels[current.labels.length - 1] ?? "Now";
  const previousValue =
    activePointIndex > 0
      ? current.values[activePointIndex - 1]
      : current.values[activePointIndex] ?? activeValue;

  const delta = activeValue - previousValue;

  const previousPeriodLabel = useMemo(() => {
    if (selectedRange === "today") return "previous time block today";
    if (selectedRange === "week") return "previous day";
    return "previous week";
  }, [selectedRange]);

  const trendText = useMemo(() => {
    if (delta === 0) return `Steady vs ${previousPeriodLabel}`;
    if (delta < 0) return `${Math.abs(delta)} pts calmer vs ${previousPeriodLabel}`;
    return `${Math.abs(delta)} pts higher vs ${previousPeriodLabel}`;
  }, [delta, previousPeriodLabel]);

  const activePoint =
    chartPoints[activePointIndex] ?? chartPoints[chartPoints.length - 1] ?? chartPoints[0];

  return (
    <>
    <View style={styles.rangeRow}>
      <Pressable
        style={[styles.rangeChip, selectedRange === "today" && styles.rangeChipActive]}
        onPress={() => onSelectRange("today")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Today range"
        accessibilityHint="Shows today trend"
        accessibilityState={{ selected: selectedRange === "today" }}
      >
        <Text
          style={[styles.rangeChipText, selectedRange === "today" && styles.rangeChipTextActive]}
          allowFontScaling={true}
        >
          Today
        </Text>
      </Pressable>
      <Pressable
        style={[styles.rangeChip, selectedRange === "week" && styles.rangeChipActive]}
        onPress={() => onSelectRange("week")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Last 7 days range"
        accessibilityHint="Shows 7 day trend"
        accessibilityState={{ selected: selectedRange === "week" }}
      >
        <Text
          style={[styles.rangeChipText, selectedRange === "week" && styles.rangeChipTextActive]}
          allowFontScaling={true}
        >
          Last 7 Days
        </Text>
      </Pressable>
      <Pressable
        style={[styles.rangeChip, selectedRange === "month" && styles.rangeChipActive]}
        onPress={() => onSelectRange("month")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="This month range"
        accessibilityHint="Shows monthly trend"
        accessibilityState={{ selected: selectedRange === "month" }}
      >
        <Text
          style={[styles.rangeChipText, selectedRange === "month" && styles.rangeChipTextActive]}
          allowFontScaling={true}
        >
          This Month
        </Text>
      </Pressable>
    </View>

    <View style={styles.chartCard}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <Ionicons name="pulse-outline" size={12} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle} accessibilityRole="header" allowFontScaling={true}>
          {current.title} Graph
        </Text>
      </View>
      <Text style={styles.chartHint} allowFontScaling={true}>
        Tap points to explore your pattern
      </Text>
      <Svg width={graphWidth} height={graphHeight}>
        {activePoint ? (
          <Line
            x1={activePoint.x}
            y1={8}
            x2={activePoint.x}
            y2={graphHeight - 8}
            stroke="#A8CAE4"
            strokeDasharray="4,6"
            strokeWidth="1.2"
          />
        ) : null}
        <Polyline
          points={pointsText}
          fill="none"
          stroke={colors.accent}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {chartPoints.map((point, index) => {
          const isActive = index === activePointIndex;

          return (
            <G key={`${point.x}-${point.y}`}>
              <Circle
                cx={point.x}
                cy={point.y}
                r="11"
                fill="transparent"
                onPress={() => setActivePointIndex(index)}
                accessibilityLabel={`${current.labels[index]} value ${current.values[index]}`}
              />
              <Circle
                cx={point.x}
                cy={point.y}
                r={isActive ? "6.2" : "3.8"}
                fill={colors.accent}
                stroke={isActive ? "#FFFFFF" : "transparent"}
                strokeWidth={isActive ? "2" : "0"}
              />
            </G>
          );
        })}
      </Svg>
      <View style={styles.labelRow}>
        {current.labels.map((label, index) => (
          <Text
            key={`${selectedRange}-${label}-${index}`}
            style={[styles.axisLabel, index === activePointIndex && styles.axisLabelActive]}
            allowFontScaling={true}
          >
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.chartPlayPanel} accessibilityLiveRegion="polite">
        <Text style={styles.chartPlayLabel} allowFontScaling={true}>
          {activeLabel}
        </Text>
        <Text style={styles.chartPlayValue} allowFontScaling={true}>
          {activeValue}
        </Text>
        <Text
          style={[styles.chartPlayTrend, delta <= 0 ? styles.chartTrendCalmer : styles.chartTrendHigher]}
          allowFontScaling={true}
        >
          {trendText}
        </Text>
      </View>
      <View style={styles.legendCompactRow}>
        <View style={styles.legendDot} />
        <Text style={styles.legendCompactText} allowFontScaling={true}>
          Regulation Trend
        </Text>
      </View>
    </View>

    <View style={styles.card}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <Ionicons name="bulb-outline" size={12} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle} accessibilityRole="header" allowFontScaling={true}>
          Insight
        </Text>
      </View>
      <Text style={styles.messageText} allowFontScaling={true}>
        {current.message}
      </Text>
    </View>
  </>
  );
};
