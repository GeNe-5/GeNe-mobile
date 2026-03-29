import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import type { AnalyticsRange, AnalyticsResponse } from "../types/api";

export const useAnalytics = (range: AnalyticsRange) => {
  return useQuery<AnalyticsResponse, Error>({
    queryKey: ["analytics", range],
    queryFn: () => analyticsApi.getAnalytics(range),
    enabled: !!range,
    staleTime: 1000 * 60 * 5,
  });
};
