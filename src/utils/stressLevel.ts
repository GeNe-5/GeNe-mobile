export type StressLevelKey =
  | "no_stress"
  | "stress_1"
  | "stress_2"
  | "stress_3"
  | "panic";

const NUMERIC_STRESS_LEVEL_MAP: Record<number, StressLevelKey> = {
  1: "no_stress",
  2: "stress_1",
  3: "stress_2",
  4: "stress_3",
  5: "panic",
};

export const STRESS_LEVEL_LABELS: Record<StressLevelKey, string> = {
  no_stress: "No Stress",
  stress_1: "Stress Level 1",
  stress_2: "Stress Level 2",
  stress_3: "Stress Level 3",
  panic: "Panic",
};

export const STRESS_LEVEL_COLORS: Record<StressLevelKey, string> = {
  no_stress: "#16A34A",
  stress_1: "#84CC16",
  stress_2: "#FACC15",
  stress_3: "#FB923C",
  panic: "#DC2626",
};

export const normalizeStressLevel = (
  level: string | number | null | undefined
): StressLevelKey | null => {
  if (typeof level === "number") {
    return NUMERIC_STRESS_LEVEL_MAP[level] ?? null;
  }

  if (typeof level !== "string") {
    return null;
  }

  const normalized = level.trim().toLowerCase();

  if (normalized in NUMERIC_STRESS_LEVEL_MAP) {
    return NUMERIC_STRESS_LEVEL_MAP[Number(normalized)] ?? null;
  }

  if (
    normalized === "no_stress" ||
    normalized === "nostress" ||
    normalized === "stress_0"
  ) {
    return "no_stress";
  }

  if (normalized === "stress_1") return "stress_1";
  if (normalized === "stress_2") return "stress_2";
  if (normalized === "stress_3") return "stress_3";

  // Backward compatibility: older backends might emit stress_4.
  if (normalized === "stress_4") return "panic";

  if (normalized === "panic") return "panic";

  return null;
};

export const getStressLevelLabel = (
  level: string | number | null | undefined
): string => {
  const normalized = normalizeStressLevel(level);
  if (!normalized) {
    return "Unknown";
  }
  return STRESS_LEVEL_LABELS[normalized];
};
