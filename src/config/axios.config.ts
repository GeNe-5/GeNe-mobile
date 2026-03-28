import axios from "axios";
import { ENV } from "./env";

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
});
