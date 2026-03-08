// src/services/libraryService.ts
import { api } from './api';

export interface LibraryEntry {
  platform: string;
  title: string;
  is_fav: boolean | number;
  status: 'not-started' | 'watching' | 'finished' | 'watchlist';
  notes: string;
  user_rating: number; // 0-5
  updated_at: string;
  runtime_mins?: number;
}

export type LibraryMap = Record<string, LibraryEntry>; // key: platform|title

export function libraryKey(platform: string, title: string): string {
  return `${platform}|${title}`;
}

export async function getLibrary(): Promise<LibraryEntry[]> {
  const data = await api<{ library: LibraryEntry[] }>('/api/library');
  return data.library || [];
}

export interface UpsertLibraryParams {
  platform: string;
  title: string;
  is_fav?: boolean;
  status?: 'not-started' | 'watching' | 'finished' | 'watchlist';
  notes?: string;
  user_rating?: number;
}

export async function upsertLibrary(params: UpsertLibraryParams): Promise<void> {
  await api('/api/library', {
    method: 'POST',
    body: {
      platform: params.platform,
      title: params.title,
      is_fav: params.is_fav ?? false,
      status: params.status ?? 'not-started',
      notes: params.notes ?? '',
      user_rating: params.user_rating ?? 0,
    },
  });
}

export interface WatchedEpisode {
  item_type: string;
  season_num: number;
  episode_num: number;
}

export async function getWatched(platform: string, title: string): Promise<WatchedEpisode[]> {
  const data = await api<{ watched: WatchedEpisode[] }>('/api/watched', {
    params: { platform, title },
  });
  return data.watched || [];
}

export async function markWatched(
  platform: string,
  title: string,
  season_num: number,
  episode_num: number,
  runtime_mins: number,
): Promise<void> {
  await api('/api/watched', {
    method: 'POST',
    body: { platform, title, season_num, episode_num, runtime_mins },
  });
}

export async function unmarkWatched(
  platform: string,
  title: string,
  season_num: number,
  episode_num: number,
): Promise<void> {
  await api('/api/watched', {
    method: 'DELETE',
    body: { platform, title, season_num, episode_num },
  });
}

export interface RatedTitle {
  platform: string;
  title: string;
  user_rating: number;
  status: string;
  is_fav: boolean;
  content_type: string;
  year: string;
  imdb_score: number;
  tomatometer: number;
  genre: string;
}

export async function getRatings(sort = 'rating'): Promise<RatedTitle[]> {
  const data = await api<{ ratings: RatedTitle[] }>('/api/ratings', {
    params: { sort },
  });
  return data.ratings || [];
}
