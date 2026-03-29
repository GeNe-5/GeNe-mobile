import type { StressLevelKey } from "../utils/stressLevel";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  durationSec: number;
  level: StressLevelKey;
  tags?: string;
}
