// src/constants/theme.ts
export const colors = {
  bg: '#13151a',
  surface: '#1a1d24',
  card: '#1e2028',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8eaf0',
  muted: '#6b7280',
  accent: '#5eead4',
  accent2: '#f472b6',
  fav: '#f472b6',
  watching: '#60a5fa',
  finished: '#34d399',
  watchlist: '#a78bfa',
  error: '#f87171',
  overlay: 'rgba(0,0,0,0.75)',
};

export const platforms: Record<string, { label: string; color: string }> = {
  netflix: { label: 'Netflix', color: '#e50914' },
  disney_plus: { label: 'Disney+', color: '#113CCF' },
  hbo_max: { label: 'HBO Max', color: '#6a23e2' },
  apple_tv: { label: 'Apple TV+', color: '#1c1c1e' },
  prime_video: { label: 'Prime Video', color: '#00a8e1' },
  hulu: { label: 'Hulu', color: '#1CE783' },
  peacock: { label: 'Peacock', color: '#0d0d0d' },
  paramount_plus: { label: 'Paramount+', color: '#0064FF' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const typography = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  h1: 32,
};
