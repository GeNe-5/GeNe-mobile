import axios from "axios";
import { ENV } from "../config/env";
import type { MusicTrack } from "../types/music";
import type { StressLevelKey } from "../utils/stressLevel";

type PixabayMusicHit = {
  id: number;
  duration?: number;
  user?: string;
  tags?: string;
  name?: string;
  audio?: {
    url?: string;
    mp3?: {
      url?: string;
    };
    ogg?: {
      url?: string;
    };
  };
  previewURL?: string;
};

type PixabayMusicResponse = {
  hits: PixabayMusicHit[];
};

const STRESS_LEVEL_QUERIES: Record<StressLevelKey, string> = {
  no_stress: "calm ambient nature",
  stress_1: "chill lofi soft piano",
  stress_2: "meditation breathing relaxation",
  stress_3: "deep calm slow instrumental",
  panic: "grounding anxiety relief calm voice",
};

const pickPlayableUrl = (hit: PixabayMusicHit): string | null => {
  return (
    hit.audio?.mp3?.url ??
    hit.audio?.url ??
    hit.audio?.ogg?.url ??
    hit.previewURL ??
    null
  );
};

export const musicApi = {
  getTracksForStressLevel: async (
    level: StressLevelKey,
    take: number = 2
  ): Promise<MusicTrack[]> => {
    if (!ENV.PIXABAY_API_KEY) {
      throw new Error(
        "Pixabay API key is missing. Set EXPO_PUBLIC_PIXABAY_API_KEY in your environment."
      );
    }

    const response = await axios.get<PixabayMusicResponse>(
      ENV.PIXABAY_API_BASE_URL,
      {
        params: {
          key: ENV.PIXABAY_API_KEY,
          q: STRESS_LEVEL_QUERIES[level],
          per_page: 12,
          safesearch: true,
        },
      }
    );

    return (response.data.hits ?? [])
      .map((hit) => {
        const previewUrl = pickPlayableUrl(hit);
        if (!previewUrl) return null;

        const track: MusicTrack = {
          id: String(hit.id),
          title: hit.name || "Untitled Track",
          artist: hit.user || "Pixabay Artist",
          previewUrl,
          durationSec: hit.duration ?? 0,
          level,
          ...(hit.tags ? { tags: hit.tags } : {}),
        };

        return track;
      })
      .filter((track): track is MusicTrack => track !== null)
      .slice(0, Math.max(1, take));
  },
};
