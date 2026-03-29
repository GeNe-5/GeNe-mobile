import { Platform } from "react-native";

const USE_FASTAPI = true;

const getBaseUrl = (): string => {
  if (USE_FASTAPI) {
    return "http://192.168.1.83:8000/api/v1";
  }
  return "http://192.168.1.83:5000/api";
};

export const ENV = {
  API_BASE_URL: getBaseUrl(),
  USE_FASTAPI,
};
