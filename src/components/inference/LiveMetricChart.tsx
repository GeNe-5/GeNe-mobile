import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface LiveMetricChartProps {
  label: string;
  unit: string;
  values: number[];
  current: number;
  min: number;
  mad: number;
}

const CHART_HEIGHT = 80;
const CHART_PADDING = 10;

export const LiveMetricChart: React.FC<LiveMetricChartProps> = ({
  label,
  unit,
  values,
  current,
  min,
  mad,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - spacing.lg * 2 - spacing.md * 2 - spacing.sm * 2;
  const svgWidth = chartWidth - CHART_PADDING * 2;
  const svgHeight = CHART_HEIGHT;

  const chartData = useMemo(() => {
    if (values.length === 0) return null;

    const allValues = [...values, current, min];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;
    const padding = range * 0.1;
    const paddedMin = minVal - padding;
    const paddedMax = maxVal + padding;
    const paddedRange = paddedMax - paddedMin || 1;

    const points = values.map((v, i) => ({
      x: CHART_PADDING + (i / (values.length - 1 || 1)) * svgWidth,
      y: svgHeight - ((v - paddedMin) / paddedRange) * (svgHeight - 20),
    }));

    return points;
  }, [values, current, min, svgWidth, svgHeight]);

  const pathD = useMemo(() => {
    if (!chartData || chartData.length < 2) return "";
    return chartData.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      return `${acc} L ${p.x} ${p.y}`;
    }, "");
  }, [chartData]);

  const lastPoint = chartData?.[chartData.length - 1];

  const formatValue = (val: number): string => {
    if (val >= 100) return val.toFixed(0);
    if (val >= 10) return val.toFixed(1);
    return val.toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.currentValue}>
          {formatValue(current)} <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {chartData && chartData.length > 1 ? (
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Path
              d={pathD}
              stroke={colors.accent}
              strokeWidth={2}
              fill="none"
            />
            {lastPoint && (
              <Circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={4}
                fill={colors.accent}
              />
            )}
          </Svg>
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>Waiting for data...</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{formatValue(min)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>MAD</Text>
          <Text style={styles.statValue}>{formatValue(mad)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  currentValue: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  unit: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  chartContainer: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  noData: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  statItem: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
