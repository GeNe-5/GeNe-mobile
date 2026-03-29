import axios, { AxiosError } from "axios";
import type { ApiError } from "../types/api";

export const parseApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    if (!axiosError.response) {
      return "Cannot reach backend API. Make sure server is running.";
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;

    if (data?.detail) {
      return data.detail;
    }

    switch (status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Authentication failed. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "Resource not found.";
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return `Server error (${status})`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export const isApiError = (error: unknown): error is AxiosError<ApiError> => {
  return axios.isAxiosError(error);
};

export const isNetworkError = (error: unknown): boolean => {
  return isApiError(error) && !error.response;
};

export const isAuthError = (error: unknown): boolean => {
  return isApiError(error) && error.response?.status === 401;
};

export const isModelUnavailableError = (error: unknown): boolean => {
  return isApiError(error) && error.response?.status === 503;
};
