import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: number;
    email: string;
    name: string;
  } | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
