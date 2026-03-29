import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiClient, handleApiError } from "../../api/client";

export type UserProfilePayload = {
  name: string;
  heightValue: string;
  heightUnit: "cm" | "ft";
  weightValue: string;
  weightUnit: "kg" | "lb";
  dateOfBirth: string;
};

export type StressAssessmentPayload = {
  section1Scores: number[];
  section1Total: number;
  stressBand: "Low stress" | "Moderate stress" | "High stress";
  stressTriggers: Record<string, number>;
  otherTriggerText: string;
  averageDailyStress: number | null;
  daysStressed: number | null;
  peakStressTime: string | null;
  duration: string | null;
  physicalSymptoms: string[];
  copingEffectiveness: Record<string, number>;
  otherCopingText: string;
  supportAvailability: string | null;
  openReflection: string;
};

const WELLNESS_ENDPOINTS = {
  saveProfile: "/users/me/profile",
  submitStressAssessment: "/wellness/stress-assessments",
} as const;

const WELLNESS_STORAGE_KEYS = {
  profile: "wellness-local-profile",
  assessments: "wellness-local-assessments",
} as const;

const USE_LOCAL_WELLNESS_FALLBACK = true;

const isNetworkError = (error: unknown) =>
  axios.isAxiosError(error) && !error.response;

const saveProfileLocally = async (payload: UserProfilePayload) => {
  await AsyncStorage.setItem(
    WELLNESS_STORAGE_KEYS.profile,
    JSON.stringify({ ...payload, savedAt: Date.now() })
  );

  return {
    status: "success",
    source: "local",
    message: "Profile saved locally (demo mode)",
  };
};

const saveAssessmentLocally = async (payload: StressAssessmentPayload) => {
  const currentRaw = await AsyncStorage.getItem(WELLNESS_STORAGE_KEYS.assessments);
  const existing = currentRaw ? (JSON.parse(currentRaw) as unknown[]) : [];

  const next = [
    ...existing,
    {
      ...payload,
      submittedAt: Date.now(),
    },
  ];

  await AsyncStorage.setItem(WELLNESS_STORAGE_KEYS.assessments, JSON.stringify(next));

  return {
    status: "success",
    source: "local",
    message: "Stress assessment saved locally (demo mode)",
  };
};

export const saveUserProfile = async (payload: UserProfilePayload) => {
  try {
    const response = await apiClient.put(WELLNESS_ENDPOINTS.saveProfile, payload);
    return response.data;
  } catch (error) {
    if (USE_LOCAL_WELLNESS_FALLBACK && isNetworkError(error)) {
      return saveProfileLocally(payload);
    }
    throw new Error(handleApiError(error));
  }
};

export const submitStressAssessment = async (payload: StressAssessmentPayload) => {
  try {
    const response = await apiClient.post(WELLNESS_ENDPOINTS.submitStressAssessment, payload);
    return response.data;
  } catch (error) {
    if (USE_LOCAL_WELLNESS_FALLBACK && isNetworkError(error)) {
      return saveAssessmentLocally(payload);
    }
    throw new Error(handleApiError(error));
  }
};
