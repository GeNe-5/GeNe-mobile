export type AnalysisRange = "today" | "week" | "month";

export type RangeData = {
  title: string;
  labels: string[];
  values: number[];
  message: string;
};

export type SavedNote = {
  id: string;
  text: string;
  createdAt: number;
};

export type ChartPoint = {
  x: number;
  y: number;
};
