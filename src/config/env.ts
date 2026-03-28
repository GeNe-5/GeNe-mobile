import { Platform } from "react-native";

const LOCAL_API = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

export const ENV = {
  API_BASE_URL: `${LOCAL_API}/api`,
};
