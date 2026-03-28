import axios from "axios";

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach backend API. Make sure server is running and API_BASE_URL is correct.";
    }
    return error.response?.data?.message || "API Error";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected Error";
};
