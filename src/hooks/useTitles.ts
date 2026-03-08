// src/hooks/useTitles.ts
import { useEffect, useCallback } from 'react';
import { useTitlesStore } from '../store/titlesStore';
import type { FilterState } from '../store/titlesStore';

export function useTitles() {
  const {
    titles,
    total,
    hasMore,
    isLoading,
    error,
    filters,
    regions,
    detectedRegion,
    platformLogos,
    loadTitles,
    loadNextPage,
    setFilter,
    resetFilters,
    loadRegions,
    detectRegion,
    loadPlatformLogos,
  } = useTitlesStore();

  // Bootstrap on mount
  useEffect(() => {
    loadRegions();
    detectRegion();
    loadPlatformLogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = useCallback(
    (patch: Partial<FilterState>) => {
      setFilter(patch);
      // Reload from page 1 after filter change
      useTitlesStore.getState().loadTitles(true);
    },
    [setFilter],
  );

  return {
    titles,
    total,
    hasMore,
    isLoading,
    error,
    filters,
    regions,
    detectedRegion,
    platformLogos,
    loadTitles,
    loadNextPage,
    applyFilter,
    resetFilters,
  };
}
