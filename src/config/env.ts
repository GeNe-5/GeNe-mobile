import { Platform } from "react-native";

const USE_FASTAPI =
  (process.env.EXPO_PUBLIC_USE_FASTAPI ?? "true").toLowerCase() === "true";

const getBaseUrl = (): string => {
  if (USE_FASTAPI) {
    return (
      process.env.EXPO_PUBLIC_FASTAPI_BASE_URL ??
      "https://candi-unrepaired-nella.ngrok-free.dev/api/v1"
    );
  }
  return process.env.EXPO_PUBLIC_LEGACY_API_BASE_URL ?? "http://192.168.1.83:5000/api";
};

export const ENV = {
  API_BASE_URL: getBaseUrl(),
  USE_FASTAPI,
  FREESOUND_API_BASE_URL:
    process.env.EXPO_PUBLIC_FREESOUND_API_BASE_URL ??
    "https://freesound.org/apiv2/search/text/",
  FREESOUND_API_KEY: process.env.EXPO_PUBLIC_FREESOUND_API_KEY ?? "",
  WS_BASE_URL_IOS: process.env.EXPO_PUBLIC_WS_BASE_URL_IOS ?? "ws://192.168.1.83:8765",
  WS_BASE_URL_ANDROID:
    process.env.EXPO_PUBLIC_WS_BASE_URL_ANDROID ?? "ws://10.0.2.2:8765",
  WS_BASE_URL_DEFAULT:
    process.env.EXPO_PUBLIC_WS_BASE_URL_DEFAULT ?? "ws://192.168.1.83:8765",
};
