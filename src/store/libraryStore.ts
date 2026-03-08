// src/store/libraryStore.ts
import { create } from 'zustand';
import {
  getLibrary,
  upsertLibrary,
  getWatched,
  markWatched,
  unmarkWatched,
  getRatings,
  libraryKey,
} from '../services/libraryService';
import type { LibraryEntry, LibraryMap, WatchedEpisode, RatedTitle } from '../services/libraryService';

interface LibraryState {
  libraryMap: LibraryMap;
  watched: WatchedEpisode[];
  ratings: RatedTitle[];
  isLoading: boolean;
  error: string | null;

  loadLibrary: () => Promise<void>;
  loadWatched: () => Promise<void>;
  loadRatings: () => Promise<void>;
  updateEntry: (
    platform: string,
    title: string,
    fields: Partial<LibraryEntry>,
  ) => Promise<void>;
  addWatched: (
    platform: string,
    title: string,
    season: number,
    episode: number,
  ) => Promise<void>;
  removeWatched: (
    platform: string,
    title: string,
    season: number,
    episode: number,
  ) => Promise<void>;
  reset: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  libraryMap: {},
  watched: [],
  ratings: [],
  isLoading: false,
  error: null,

  loadLibrary: async () => {
    set({ isLoading: true, error: null });
    try {
      const map = await getLibrary();
      set({ libraryMap: map });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to load library' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadWatched: async () => {
    try {
      const watched = await getWatched();
      set({ watched });
    } catch {
      // non-fatal, leave existing state
    }
  },

  loadRatings: async () => {
    try {
      const ratings = await getRatings();
      set({ ratings });
    } catch {
      // non-fatal
    }
  },

  updateEntry: async (platform, title, fields) => {
    const key = libraryKey(platform, title);
    const existing = get().libraryMap[key];

    // Optimistic update
    const optimistic: LibraryEntry = {
      platform,
      title,
      is_fav: false,
      status: null,
      rating: null,
      content_type: 'movie',
      release_year: '',
      imdb_score: 0,
      tomatometer: 0,
      updated_at: new Date().toISOString(),
      ...existing,
      ...fields,
    };
    set((s) => ({ libraryMap: { ...s.libraryMap, [key]: optimistic } }));

    try {
      const saved = await upsertLibrary(platform, title, fields);
      set((s) => ({ libraryMap: { ...s.libraryMap, [key]: saved } }));
    } catch (e) {
      // Roll back
      set((s) => {
        const reverted = { ...s.libraryMap };
        if (existing) {
          reverted[key] = existing;
        } else {
          delete reverted[key];
        }
        return { libraryMap: reverted };
      });
      throw e;
    }
  },

  addWatched: async (platform, title, season, episode) => {
    await markWatched(platform, title, season, episode);
    const watched = await getWatched();
    set({ watched });
  },

  removeWatched: async (platform, title, season, episode) => {
    await unmarkWatched(platform, title, season, episode);
    set((s) => ({
      watched: s.watched.filter(
        (w) =>
          !(
            w.platform === platform &&
            w.title === title &&
            w.season === season &&
            w.episode === episode
          ),
      ),
    }));
  },

  reset: () => set({ libraryMap: {}, watched: [], ratings: [], error: null }),
}));
