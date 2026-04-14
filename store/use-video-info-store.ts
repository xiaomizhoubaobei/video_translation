import { produce } from "immer";
import { create } from "zustand";
import { storeMiddleware } from "./middleware";

export type Subtitle = {
  index: number;
  startTime: number;
  end: number;
  text: string;
};

export interface VideoInfoState {
  _hasHydrated: false;

  id?: string;
  originalVideoUrl?: string;
  realVideoUrl?: string;
  title?: string;
  poster?: string;
  videoType?: string;
  language?: string;
  displayLanguage?: string;
  originalSubtitles?: Subtitle[];
  subtitles?: Subtitle[];

  createdAt: number;
  updatedAt: number;
}

export interface VideoInfoShare {
  id: string;
  originalVideoUrl: string;
  realVideoUrl: string;
  title: string;
  poster: string;
  videoType: string;
  language: string;
  displayLanguage: string;
  subtitles: Subtitle[];
  originalSubtitles: Subtitle[];
}

interface VideoInfoActions {
  refresh: () => void;
  updateField: <T extends keyof VideoInfoState>(field: T, value: VideoInfoState[T]) => void;
  updateAll: (fields: Partial<VideoInfoState>) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useVideoInfoStore = create<VideoInfoState & VideoInfoActions>()(
  storeMiddleware<VideoInfoState & VideoInfoActions>(
    (set) => ({
      _hasHydrated: false,
      id: "",
      originalVideoUrl: "",
      realVideoUrl: "",
      title: "",
      poster: "",
      videoType: "",
      language: "",
      displayLanguage: "",
      originalSubtitles: [],
      subtitles: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),

      refresh: () =>
        set(
          produce((state) => {
            state.createdAt = Date.now();
            state.updatedAt = Date.now();
          }),
        ),
      updateField: (field, value) =>
        set(
          produce((state) => {
            state[field] = value;
            state.updatedAt = Date.now();
          }),
        ),
      updateAll: (fields) =>
        set(
          produce((state) => {
            for (const [key, value] of Object.entries(fields)) {
              state[key as keyof VideoInfoState] = value;
            }
            state.updatedAt = Date.now();
          }),
        ),
      setHasHydrated: (value) =>
        set(
          produce((state) => {
            state._hasHydrated = value;
          }),
        ),
    }),
    "video_info_store",
  ),
);

export const useVideoInfoStoreActions = () => useVideoInfoStore((state) => state);
