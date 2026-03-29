import { apiClient } from "./client";
import { InferenceFeatures, InferenceResponse } from "../types/inference";
import type { InferenceRecord, ModelStatusResponse } from "../types/api";

export const inferenceApi = {
  predict: async (data: InferenceFeatures): Promise<InferenceResponse> => {
    const response = await apiClient.post<InferenceResponse>(
      "/inference/predict",
      data
    );
    return response.data;
  },

  predictLegacy: async (
    data: InferenceFeatures
  ): Promise<InferenceResponse> => {
    const response = await apiClient.post<InferenceResponse>(
      "/inference/predict",
      data
    );
    return response.data;
  },

  getHistory: async (limit: number = 100): Promise<InferenceRecord[]> => {
    const response = await apiClient.get<InferenceRecord[]>(
      "/inference/records",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  getModelStatus: async (): Promise<ModelStatusResponse> => {
    const response = await apiClient.get<ModelStatusResponse>(
      "/inference/model-status"
    );
    return response.data;
  },
};
