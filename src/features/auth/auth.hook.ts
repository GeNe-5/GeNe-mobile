import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi, saveAuthData, clearAuthData } from "../../api/auth";
import { userApi } from "../../api/user";
import { useAuthStore } from "./auth.store";
import type { LoginInput, RegisterInput } from "./auth.schema";
import type { User } from "../../types/api";

export const useRegisterUser = () => {
  return useMutation<{ message: string; user_id: number }, Error, RegisterInput>({
    mutationFn: async (payload) => {
      const response = await authApi.register(payload);
      return response;
    },
  });
};

export const useLoginUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  
  return useMutation<{ access_token: string; refresh_token: string; user: User }, Error, LoginInput>({
    mutationFn: async (payload) => {
      const response = await authApi.login(payload);
      saveAuthData(response.access_token, response.refresh_token, response.user);
      setUser(response.user);
      return response;
    },
  });
};

export const useCurrentUser = () => {
  const user = useAuthStore((state) => state.user);
  
  return useQuery<User | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      useAuthStore.getState().setUser(response);
      return response;
    },
    enabled: !!useAuthStore.getState().accessToken,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLogout = () => {
  return () => {
    clearAuthData();
  };
};

export const useRefreshUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  
  return useMutation<User, Error>({
    mutationFn: async () => {
      const response = await authApi.getCurrentUser();
      setUser(response);
      return response;
    },
  });
};
