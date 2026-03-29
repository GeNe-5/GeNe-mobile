import axios from "axios";
import { ENV } from "../config/env";
import type { MusicTrack } from "../types/music";
import type { StressLevelKey } from "../utils/stressLevel";

type FreesoundAudioHit = {
  id: number;
  duration?: number;
  username?: string;
  tags?: string[];
  name?: string;
  previews?: {
    "preview-hq-mp3"?: string;
    "preview-lq-mp3"?: string;
  };
};

type FreesoundSearchResponse = {
  results: FreesoundAudioHit[];
};

type FreesoundSoundDetailsResponse = {
  id: number;
  duration?: number;
  username?: string;
  tags?: string[];
  name?: string;
  previews?: {
    "preview-hq-mp3"?: string;
    "preview-lq-mp3"?: string;
  };
};

const STRESS_LEVEL_QUERIES: Record<StressLevelKey, string> = {
  no_stress: "calm ambient nature",
  stress_1: "chill lofi soft piano",
  stress_2: "meditation breathing relaxation",
  stress_3: "deep calm slow instrumental",
  panic: "anxiety relief",
};

const pickPlayableUrl = (hit: FreesoundAudioHit): string | null => {
  return hit.previews?.["preview-hq-mp3"] ?? hit.previews?.["preview-lq-mp3"] ?? null;
};

const fetchSoundPreview = async (
  soundId: number
): Promise<FreesoundSoundDetailsResponse | null> => {
  try {
    const detailsResponse = await axios.get<FreesoundSoundDetailsResponse>(
      `https://freesound.org/apiv2/sounds/${soundId}/`,
      {
        params: {
          token: ENV.FREESOUND_API_KEY,
          fields: "id,name,username,duration,tags,previews",
        },
      }
    );

    return detailsResponse.data;
  } catch {
    return null;
  }
};

export const musicApi = {
  getTracksForStressLevel: async (
    level: StressLevelKey,
    take: number = 2
  ): Promise<MusicTrack[]> => {
    if (!ENV.FREESOUND_API_KEY) {
      throw new Error(
        "Freesound API key is missing. Set EXPO_PUBLIC_FREESOUND_API_KEY in your environment."
      );
    }

    const response = await axios.get<FreesoundSearchResponse>(
      ENV.FREESOUND_API_BASE_URL,
      {
        params: {
          token: ENV.FREESOUND_API_KEY,
          query: STRESS_LEVEL_QUERIES[level],
          page_size: 12,
          fields: "id,name,username,duration,tags,previews",
        },
      }
    );

    const candidates = response.data.results ?? [];

    const mappedTracks = await Promise.all(
      candidates.map(async (hit) => {
        let enrichedHit: FreesoundAudioHit = hit;
        let previewUrl = pickPlayableUrl(hit);

        // Some search responses omit preview fields unless explicitly expanded;
        // fetch the sound details as a fallback so playback still works.
        if (!previewUrl) {
          const details = await fetchSoundPreview(hit.id);
          if (!details) {
            return null;
          }

          enrichedHit = {
            id: details.id,
            duration: details.duration,
            username: details.username,
            tags: details.tags,
            name: details.name,
            previews: details.previews,
          };
          previewUrl = pickPlayableUrl(enrichedHit);
        }

        if (!previewUrl) {
          return null;
        }

        const track: MusicTrack = {
          id: String(enrichedHit.id),
          title: enrichedHit.name || "Untitled Track",
          artist: enrichedHit.username || "Freesound Creator",
          previewUrl,
          durationSec: Math.round(enrichedHit.duration ?? 0),
          level,
          ...(enrichedHit.tags?.length
            ? { tags: enrichedHit.tags.join(", ") }
            : {}),
        };

        return track;
      })
    );

    return mappedTracks
      .filter((track): track is MusicTrack => track !== null)
      .slice(0, Math.max(1, take));
  },
};
