import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const birthdateSchema = z.object({
  birthdate: z.string().min(1, "Birthdate is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
});

export const weightSchema = z.object({
  weight: z.string().min(1, "Weight is required").transform((val) => Number(val)).pipe(z.number().positive("Weight must be a positive number")),
});

export const reportDateSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "Start date must be before end date",
  path: ["start_date"],
});

export const STRESS_PREDICTION_FIELDS = [
  { name: "hr_mean", label: "Heart Rate Mean (bpm)", placeholder: "75.0" },
  { name: "hr_std", label: "Heart Rate Std Dev", placeholder: "10.0" },
  { name: "hr_min", label: "Heart Rate Min", placeholder: "60.0" },
  { name: "hr_max", label: "Heart Rate Max", placeholder: "90.0" },
  { name: "rmssd_mean", label: "RMSSD Mean (ms)", placeholder: "30.0" },
  { name: "rmssd_std", label: "RMSSD Std Dev", placeholder: "5.0" },
  { name: "rmssd_min", label: "RMSSD Min", placeholder: "20.0" },
  { name: "rmssd_max", label: "RMSSD Max", placeholder: "40.0" },
  { name: "lf_hf_ratio", label: "LF/HF Ratio", placeholder: "1.5" },
  { name: "activity_steps", label: "Activity Steps", placeholder: "100" },
  { name: "activity_calories", label: "Activity Calories", placeholder: "50.0" },
  { name: "activity_level", label: "Activity Level (0-1)", placeholder: "0.5" },
  { name: "temp_mean", label: "Temperature Mean (°C)", placeholder: "36.5" },
  { name: "temp_std", label: "Temperature Std Dev", placeholder: "0.2" },
  { name: "temp_range", label: "Temperature Range", placeholder: "0.5" },
  { name: "eda_scl_mean", label: "EDA SCL Mean (μS)", placeholder: "3.5" },
  { name: "eda_scl_std", label: "EDA SCL Std Dev", placeholder: "0.03" },
  { name: "eda_scr_count", label: "EDA SCR Count", placeholder: "5" },
  { name: "eda_scr_amp_mean", label: "EDA SCR Amplitude Mean", placeholder: "0.02" },
  { name: "resp_rate", label: "Respiratory Rate (breaths/min)", placeholder: "15.0" },
  { name: "resp_var", label: "Respiratory Variability", placeholder: "2.0" },
] as const;

export const stressPredictionSchema = z.object({
  hr_mean: z.string().transform((val) => Number(val)),
  hr_std: z.string().transform((val) => Number(val)),
  hr_min: z.string().transform((val) => Number(val)),
  hr_max: z.string().transform((val) => Number(val)),
  rmssd_mean: z.string().transform((val) => Number(val)),
  rmssd_std: z.string().transform((val) => Number(val)),
  rmssd_min: z.string().transform((val) => Number(val)),
  rmssd_max: z.string().transform((val) => Number(val)),
  lf_hf_ratio: z.string().transform((val) => Number(val)),
  activity_steps: z.string().transform((val) => Number(val)),
  activity_calories: z.string().transform((val) => Number(val)),
  activity_level: z.string().transform((val) => Number(val)),
  temp_mean: z.string().transform((val) => Number(val)),
  temp_std: z.string().transform((val) => Number(val)),
  temp_range: z.string().transform((val) => Number(val)),
  eda_scl_mean: z.string().transform((val) => Number(val)),
  eda_scl_std: z.string().transform((val) => Number(val)),
  eda_scr_count: z.string().transform((val) => Number(val)),
  eda_scr_amp_mean: z.string().transform((val) => Number(val)),
  resp_rate: z.string().transform((val) => Number(val)),
  resp_var: z.string().transform((val) => Number(val)),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BirthdateInput = z.infer<typeof birthdateSchema>;
export type WeightInput = z.infer<typeof weightSchema>;
export type ReportDateInput = z.infer<typeof reportDateSchema>;
export type StressPredictionInput = z.infer<typeof stressPredictionSchema>;
