// src/services/profileService.ts
import { api } from './api';

export interface WatchTime {
  total_minutes: number;
  hours: number;
  minutes: number;
  label: string;
}

export interface TopGenre {
  genre: string;
  count: number;
}

export interface ProfileStats {
  total_in_library: number;
  favourites: number;
  movies_finished: number;
  movies_watching: number;
  movies_in_library: number;
  tv_finished: number;
  tv_watching: number;
  episodes_watched: number;
  movie_watch_time: WatchTime;
  tv_watch_time: WatchTime;
  total_watch_time: WatchTime;
  top_genres: TopGenre[];
}

export interface Profile {
  username: string;
  display_name: string;
  email: string;
  auth_type: string;
  member_since: string;
  profile_pic: string;
  home_country: string;
  library_public: boolean;
  stats: ProfileStats;
  pic_position_y: number;
}

export async function getProfile(): Promise<Profile> {
  return api<Profile>('/api/profile');
}

export interface UpdateProfileParams {
  display_name?: string;
  profile_pic?: string;
  home_country?: string;
  library_public?: boolean;
  pic_position_y?: number;
  username?: string;
}

export async function updateProfile(params: UpdateProfileParams): Promise<void> {
  await api('/api/profile', { method: 'POST', body: params });
}

export interface WatchtimeTitle {
  platform: string;
  title: string;
  status: string;
  content_type: string;
  genre: string;
  imdb_score: number;
  release_year: string;
  watch_mins: number;
  episodes_watched: number;
}

export async function getWatchtimeTitles(): Promise<WatchtimeTitle[]> {
  const data = await api<{ titles: WatchtimeTitle[] }>('/api/profile/watchtime');
  return data.titles || [];
}
