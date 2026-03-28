import { useMutation } from "@tanstack/react-query";
import { MOCK_LOGIN_CREDENTIALS } from "../../common/data/mockData";
import type { LoginInput, RegisterInput } from "./auth.schema";

const AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
} as const;

type RegisterResponse = {
  status: string;
  message: string;
  endpoint: string;
};

type LoginResponse = {
  status: string;
  message: string;
  data: { accessToken: string };
  endpoint: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useRegisterUser = () => {
  return useMutation<RegisterResponse, unknown, RegisterInput>({
    mutationFn: async () => {
      await wait(600);

      return {
        status: "success",
        message: "Registration successful",
        endpoint: AUTH_ENDPOINTS.register,
      };
    },
  });
};

export const useLoginUser = () => {
  return useMutation<LoginResponse, unknown, LoginInput>({
    mutationFn: async (payload) => {
      await wait(700);

      const isValidEmail =
        payload.email.trim().toLowerCase() === MOCK_LOGIN_CREDENTIALS.email;
      const isValidPassword = payload.password === MOCK_LOGIN_CREDENTIALS.password;

      if (!isValidEmail || !isValidPassword) {
        throw new Error(
          `Invalid credentials. Use ${MOCK_LOGIN_CREDENTIALS.email} / ${MOCK_LOGIN_CREDENTIALS.password}`
        );
      }

      return {
        status: "success",
        message: "Login successful",
        endpoint: AUTH_ENDPOINTS.login,
        data: {
          accessToken: "mock-access-token",
        },
      };
    },
  });
};
