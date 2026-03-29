import { Platform } from "react-native";

const USE_FASTAPI = true;

const getBaseUrl = (): string => {
  if (USE_FASTAPI) {
    return "https://candi-unrepaired-nella.ngrok-free.dev/api/v1";
  }
  return "http://192.168.1.83:5000/api";
};

export const ENV = {
  API_BASE_URL: getBaseUrl(),
  USE_FASTAPI,
  PIXABAY_API_BASE_URL: "https://pixabay.com/api/music/",
  PIXABAY_API_KEY: "55223370-5892e510692400ad458bc4e62",
};
