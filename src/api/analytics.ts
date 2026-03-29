import { apiClient } from "./client";
import type { AnalyticsResponse, AnalyticsRange } from "../types/api";

export const analyticsApi = {
  getAnalytics: async (range: AnalyticsRange): Promise<AnalyticsResponse> => {
    const response = await apiClient.get<AnalyticsResponse>("/inference/analytics", {
      params: { range },
    });
    return response.data;
  },
};
