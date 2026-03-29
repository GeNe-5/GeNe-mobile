export const mean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

export const std = (values: number[]): number => {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

export const min = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.min(...values);
};

export const max = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.max(...values);
};

export const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

export const mad = (values: number[]): number => {
  if (values.length === 0) return 0;
  const med = median(values);
  const absDiffs = values.map((v) => Math.abs(v - med));
  return median(absDiffs);
};

export const clamp = (value: number, minVal: number, maxVal: number): number => {
  return Math.max(minVal, Math.min(maxVal, value));
};

export const sum = (values: number[]): number => {
  return values.reduce((acc, v) => acc + v, 0);
};

export const count = (values: boolean[]): number => {
  return values.filter((v) => v).length;
};

export const meanOfFiltered = (
  values: number[],
  filter: boolean[]
): number => {
  const filtered = values.filter((_, i) => filter[i]);
  if (filtered.length === 0) return 0;
  return mean(filtered);
};
