// src/services/titlesService.ts
import { api } from './api';
import { SERVER_BATCH } from '../constants/api';

export interface Title {
  platform: string;
  title: string;
  content_type: 'movie' | 'tv';
  imdb_score: number;
  imdb_votes: number;
  tomatometer: number;
  tmdb_score: number;
  runtime_mins: number;
  end_year: string;
  is_ongoing: number | boolean | null;
  num_seasons: number;
  synopsis: string;
  release_year: string | number;
  genre: string;
  maturity_rating: string;
  source_url: string;
  is_trending: number;
  platforms: string;
  regions: string;
  platform_regions_raw?: string;
  platform_urls_raw?: string;
  is_fav: boolean | number;
  status: 'not-started' | 'watching' | 'finished' | 'watchlist';
  notes?: string;
  ranking_position: number;
  ranking_region?: string;
  // parsed client-side
  platform_urls?: Record<string, string> | null;
  platform_regions?: Record<string, string[]> | null;
}

export interface TitlesResponse {
  titles: Title[];
  total: number;
  region_count?: number;
}

export type SortKey = 'rank' | 'imdb' | 'rt' | 'year' | 'title';

export interface TitlesParams {
  sort?: SortKey;
  limit?: number;
  offset?: number;
  platform?: string;
  region?: string;
  type?: 'movie' | 'tv' | '';
  trending?: boolean;
  unique?: boolean;
  search?: string;
}

export function parseTitleUrls(t: Title): Title {
  // Parse platform_urls_raw: "netflix|https://...,disney_plus|https://..."
  if (t.platform_urls_raw) {
    const urlMap: Record<string, string> = {};
    t.platform_urls_raw.split(',').forEach(pu => {
      const idx = pu.indexOf('|');
      if (idx === -1) return;
      const p = pu.slice(0, idx).trim();
      const url = pu.slice(idx + 1).trim();
      if (url && !url.includes('apis.justwatch.com')) urlMap[p] = url;
    });
    t.platform_urls = Object.keys(urlMap).length ? urlMap : null;
  } else if (t.source_url && !t.source_url.includes('apis.justwatch.com')) {
    t.platform_urls = { [t.platform]: t.source_url };
  } else {
    t.platform_urls = null;
  }

  // Parse platform_regions_raw: "netflix|US,disney_plus|GB,..."
  if (t.platform_regions_raw) {
    const prMap: Record<string, string[]> = {};
    t.platform_regions_raw.split(',').forEach(pr => {
      const idx = pr.indexOf('|');
      if (idx === -1) return;
      const p = pr.slice(0, idx).trim();
      const r = pr.slice(idx + 1).trim();
      if (!prMap[p]) prMap[p] = [];
      if (!prMap[p].includes(r)) prMap[p].push(r);
    });
    t.platform_regions = prMap;
  } else {
    t.platform_regions = null;
  }

  return t;
}

export async function getTitles(params: TitlesParams = {}): Promise<TitlesResponse> {
  const data = await api<TitlesResponse>('/api/titles', {
    params: {
      limit: params.limit ?? SERVER_BATCH,
      sort: params.sort ?? 'rank',
      unique: params.unique ? '1' : undefined,
      trending: params.trending ? '1' : undefined,
      platform: params.platform && params.platform !== 'all' ? params.platform : undefined,
      region: params.region && params.region !== 'all' ? params.region : undefined,
      type: params.type || undefined,
      search: params.search || undefined,
      offset: params.offset ?? 0,
    },
  });

  data.titles = data.titles.map(parseTitleUrls);
  return data;
}

export async function getRegions(): Promise<string[]> {
  const data = await api<{ regions: string[] }>('/api/regions');
  return data.regions;
}

export async function getGeoip(): Promise<string> {
  try {
    const data = await api<{ country: string }>('/api/geoip');
    return data.country || '';
  } catch {
    return '';
  }
}

export async function getPlatformLogos(): Promise<Record<string, string>> {
  try {
    const data = await api<Record<string, string>>('/api/platform-logos');
    return data;
  } catch {
    return {};
  }
}

export async function saveRuntime(platform: string, title: string, runtime_mins: number): Promise<void> {
  await api('/api/titles/runtime', {
    method: 'PATCH',
    body: { platform, title, runtime_mins },
  });
}

export async function saveEndYear(platform: string, title: string, end_year: string): Promise<void> {
  await api('/api/titles/end_year', {
    method: 'PATCH',
    body: { platform, title, end_year },
  });
}

export async function saveIsOngoing(platform: string, title: string, is_ongoing: boolean): Promise<void> {
  await api('/api/titles/is_ongoing', {
    method: 'PATCH',
    body: { platform, title, is_ongoing },
  });
}

export async function getUpcoming(force = false): Promise<UpcomingResponse> {
  return api<UpcomingResponse>('/api/upcoming', {
    params: force ? { force: '1' } : undefined,
  });
}

export interface UpcomingEpisode {
  title_key: string;
  season_number: number;
  episode_number: number;
  name: string;
  overview: string;
  air_date: string;
  diff_days: number;
  runtime?: number;
  still_path?: string;
  vote_average?: number;
  vote_count?: number;
  crew?: { name: string; job: string }[];
  guest_stars?: { name: string; character: string; profile_path?: string }[];
}

export interface ShowData {
  tmdb_id: number;
  is_ongoing: boolean;
  end_year: string;
  poster_thumb: string;
  cast?: { name: string; character: string; profile_path?: string }[];
  show_overview?: string;
}

export interface UpcomingResponse {
  episodes: UpcomingEpisode[];
  show_data: Record<string, ShowData>;
}
