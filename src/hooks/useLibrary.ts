// src/hooks/useLibrary.ts
import { useEffect } from 'react';
import { useLibraryStore } from '../store/libraryStore';
import { libraryKey } from '../services/libraryService';
import type { LibraryEntry } from '../services/libraryService';

export function useLibrary() {
  const {
    libraryMap,
    watched,
    ratings,
    isLoading,
    error,
    loadLibrary,
    loadWatched,
    loadRatings,
    updateEntry,
    addWatched,
    removeWatched,
    reset,
  } = useLibraryStore();

  useEffect(() => {
    loadLibrary();
    loadWatched();
    loadRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEntry = (platform: string, title: string): LibraryEntry | undefined =>
    libraryMap[libraryKey(platform, title)];

  const isFav = (platform: string, title: string): boolean =>
    !!libraryMap[libraryKey(platform, title)]?.is_fav;

  const getStatus = (platform: string, title: string): string | null =>
    libraryMap[libraryKey(platform, title)]?.status ?? null;

  const isEpisodeWatched = (
    platform: string,
    title: string,
    season: number,
    episode: number,
  ): boolean =>
    watched.some(
      (w) =>
        w.platform === platform &&
        w.title === title &&
        w.season === season &&
        w.episode === episode,
    );

  const toggleFav = (platform: string, title: string) =>
    updateEntry(platform, title, { is_fav: !isFav(platform, title) });

  const setStatus = (platform: string, title: string, status: string | null) =>
    updateEntry(platform, title, { status });

  return {
    libraryMap,
    watched,
    ratings,
    isLoading,
    error,
    getEntry,
    isFav,
    getStatus,
    isEpisodeWatched,
    toggleFav,
    setStatus,
    updateEntry,
    addWatched,
    removeWatched,
    reload: () => { loadLibrary(); loadWatched(); loadRatings(); },
    reset,
  };
}
