export const MOCK_LOGIN_CREDENTIALS = {
  email: "demo@gene.com",
  password: "Demo@123",
} as const;

export type MockTrack = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  mood: string;
  bpm: number;
  intensity: "low" | "medium" | "high";
  coverColor: string;
  previewUrl: string;
};

export const MOCK_TRACKS: MockTrack[] = [
  {
    id: "track-ocean",
    title: "Ocean Breath",
    artist: "Mira Sol",
    duration: "8:40",
    mood: "Reset",
    bpm: 62,
    intensity: "low",
    coverColor: "#DDF1FF",
    previewUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  },
  {
    id: "track-rain",
    title: "Focus Rain",
    artist: "North Echo",
    duration: "6:10",
    mood: "Focus",
    bpm: 72,
    intensity: "medium",
    coverColor: "#E7F4FF",
    previewUrl: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
  },
  {
    id: "track-unwind",
    title: "Evening Unwind",
    artist: "Luna Harbor",
    duration: "10:05",
    mood: "Sleep",
    bpm: 58,
    intensity: "low",
    coverColor: "#EAF3FF",
    previewUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
  },
  {
    id: "track-night",
    title: "Night Sky Piano",
    artist: "Arden Bloom",
    duration: "12:22",
    mood: "Deep Calm",
    bpm: 54,
    intensity: "low",
    coverColor: "#E4EEFF",
    previewUrl: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
  },
  {
    id: "track-forest",
    title: "Forest Drift",
    artist: "Sage Field",
    duration: "7:48",
    mood: "Grounding",
    bpm: 66,
    intensity: "medium",
    coverColor: "#E8F7F3",
    previewUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
  },
  {
    id: "track-aurora",
    title: "Aurora Sleep",
    artist: "Nila Wave",
    duration: "9:56",
    mood: "Soft Sleep",
    bpm: 52,
    intensity: "low",
    coverColor: "#EFEAFF",
    previewUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  },
];

export const MOCK_PLAYLISTS = [
  "Morning Reset",
  "Deep Work Calm",
  "Evening Soft Flow",
  "Soft Piano Clouds",
];

export const MOCK_GROUNDING_ANCHORS = [
  "4-6 Breathing",
  "Shoulder Relax",
  "Body Scan",
  "Butterfly Tap",
];

export const DAILY_APPRECIATIONS = [
  "You showed up for yourself today.",
  "Small calm moments are adding up.",
  "Your consistency matters more than intensity.",
  "Breathing and music are working together well.",
  "You are doing better than you think.",
  "Recovery is a skill, and you are practicing it.",
  "Progress is visible. Keep this rhythm going.",
];

export const LANDING_HIGHLIGHTS = [
  "New mood-based recommendations every day",
  "Simple journaling for emotional release",
  "Clear weekly stress trend insights",
];

export const LANDING_STATS = [
  { id: "users", label: "Active listeners", value: "12.4k" },
  { id: "sessions", label: "Calm sessions today", value: "4.1k" },
  { id: "streak", label: "Avg. habit streak", value: "18 days" },
];