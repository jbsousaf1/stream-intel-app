// src/store/titlesStore.ts
import { create } from 'zustand';
import {
  getTitles,
  parseTitleUrls,
  getRegions,
  getGeoip,
  getPlatformLogos,
} from '../services/titlesService';
import type { Title, TitlesParams, SortKey } from '../services/titlesService';

export type FilterContentType = 'all' | 'movie' | 'show';

export interface FilterState {
  contentType: FilterContentType;
  platform: string;          // '' = all
  status: string;            // '' = all | 'watching' | 'planned' | 'completed' | 'paused' | 'dropped'
  genre: string;             // '' = all
  region: string;            // '' = detected | explicit code
  searchQuery: string;
  sort: SortKey;
  yearFrom: number;
  yearTo: number;
}

const DEFAULT_FILTERS: FilterState = {
  contentType: 'all',
  platform: '',
  status: '',
  genre: '',
  region: '',
  searchQuery: '',
  sort: 'score',
  yearFrom: 1970,
  yearTo: new Date().getFullYear(),
};

interface TitlesState {
  titles: Title[];
  total: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  filters: FilterState;

  regions: string[];
  detectedRegion: string;
  platformLogos: Record<string, string>;

  // actions
  loadTitles: (reset?: boolean) => Promise<void>;
  loadNextPage: () => Promise<void>;
  setFilter: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;
  loadRegions: () => Promise<void>;
  detectRegion: () => Promise<void>;
  loadPlatformLogos: () => Promise<void>;
  setTitleOptimistic: (id: number, patch: Partial<Title>) => void;
}

export const useTitlesStore = create<TitlesState>((set, get) => ({
  titles: [],
  total: 0,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
  filters: { ...DEFAULT_FILTERS },
  regions: [],
  detectedRegion: '',
  platformLogos: {},

  loadTitles: async (reset = true) => {
    const { filters, page } = get();
    const currentPage = reset ? 1 : page;

    set({ isLoading: true, error: null });
    try {
      const params: TitlesParams = {
        page: currentPage,
        per_page: 40,
        sort: filters.sort,
        content_type: filters.contentType !== 'all' ? filters.contentType : undefined,
        platform: filters.platform || undefined,
        status: filters.status || undefined,
        genre: filters.genre || undefined,
        region: filters.region || filters.detectedRegion || undefined,
        q: filters.searchQuery || undefined,
        year_from: filters.yearFrom,
        year_to: filters.yearTo,
      };

      const res = await getTitles(params);
      const parsed = res.titles.map(parseTitleUrls);

      if (reset) {
        set({ titles: parsed, total: res.total, page: 2, hasMore: res.titles.length === 40 });
      } else {
        set((s) => ({
          titles: [...s.titles, ...parsed],
          total: res.total,
          page: s.page + 1,
          hasMore: parsed.length === 40,
        }));
      }
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to load titles' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadNextPage: async () => {
    if (get().isLoading || !get().hasMore) return;
    await get().loadTitles(false);
  },

  setFilter: (patch) => {
    set((s) => ({ filters: { ...s.filters, ...patch } }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS, region: get().detectedRegion } });
  },

  loadRegions: async () => {
    try {
      const regions = await getRegions();
      set({ regions });
    } catch {
      // use existing
    }
  },

  detectRegion: async () => {
    try {
      const geo = await getGeoip();
      const region = geo.country_code || '';
      set({ detectedRegion: region });
      set((s) => ({
        filters: s.filters.region === ''
          ? { ...s.filters, region }
          : s.filters,
      }));
    } catch {
      // ignore
    }
  },

  loadPlatformLogos: async () => {
    try {
      const logos = await getPlatformLogos();
      set({ platformLogos: logos });
    } catch {
      // ignore
    }
  },

  setTitleOptimistic: (id, patch) => {
    set((s) => ({
      titles: s.titles.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  },
}));
