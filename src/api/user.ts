import { apiClient } from "./client";
import type { User, UpdateBirthdateRequest, UpdateWeightRequest } from "../types/api";

export const userApi = {
  getUserById: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/auth/users/${userId}`);
    return response.data;
  },

  updateBirthdate: async (userId: number, data: UpdateBirthdateRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/auth/users/${userId}/birthdate`, data);
    return response.data;
  },

  updateWeight: async (userId: number, data: UpdateWeightRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/auth/users/${userId}/weight`, data);
    return response.data;
  },
};
