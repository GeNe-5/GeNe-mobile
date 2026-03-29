import { apiClient, injectToken } from "./client";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from "../types/api";

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};

export const saveAuthData = (
  accessToken: string,
  refreshToken: string,
  user: User
): void => {
  injectToken(accessToken);
  useAuthStore.getState().setTokens(accessToken, refreshToken);
  useAuthStore.getState().setUser({
    id: user.id,
    email: user.email,
    name: user.name,
  });
};

export const clearAuthData = (): void => {
  useAuthStore.getState().logout();
};

import { useAuthStore } from "../features/auth/auth.store";
