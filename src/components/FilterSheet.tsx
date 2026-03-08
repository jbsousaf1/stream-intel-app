// src/components/FilterSheet.tsx
/**
 * Bottom sheet for filtering the title catalog.
 * Uses @gorhom/bottom-sheet BottomSheetModal.
 * Call via ref: filterSheetRef.current?.present()
 */
import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { colors, spacing, radius } from '../constants/theme';
import { useTitlesStore, type FilterState } from '../store/titlesStore';

const PLATFORMS = ['Netflix', 'Disney+', 'HBO Max', 'Apple TV+', 'Amazon Prime Video', 'Hulu', 'Peacock', 'Paramount+'];
const STATUSES = ['watching', 'completed', 'planned', 'paused', 'dropped'];
const SORTS: { key: FilterState['sort']; label: string }[] = [
  { key: 'score', label: 'Score' },
  { key: 'title', label: 'Title A-Z' },
  { key: 'year', label: 'Year' },
  { key: 'updated', label: 'Recently Updated' },
  { key: 'imdb', label: 'IMDb' },
  { key: 'rt', label: 'Rotten Tomatoes' },
];

interface Props {
  onApply?: () => void;
}

const FilterSheet = forwardRef<BottomSheetModal, Props>(({ onApply }, ref) => {
  const filters = useTitlesStore((s) => s.filters);
  const setFilter = useTitlesStore((s) => s.setFilter);
  const resetFilters = useTitlesStore((s) => s.resetFilters);
  const loadTitles = useTitlesStore((s) => s.loadTitles);

  const snapPoints = useMemo(() => ['70%', '92%'], []);

  const apply = useCallback(() => {
    loadTitles(true);
    (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    onApply?.();
  }, [loadTitles, onApply, ref]);

  const reset = useCallback(() => {
    resetFilters();
    loadTitles(true);
    (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
  }, [resetFilters, loadTitles, ref]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Filters & Sort</Text>

        {/* Content type */}
        <Text style={styles.sectionLabel}>Type</Text>
        <View style={styles.chipRow}>
          {(['all', 'movie', 'show'] as const).map((ct) => (
            <Chip
              key={ct}
              label={ct === 'all' ? 'All' : ct === 'movie' ? 'Movies' : 'Shows'}
              active={filters.contentType === ct}
              onPress={() => setFilter({ contentType: ct })}
            />
          ))}
        </View>

        {/* Platform */}
        <Text style={styles.sectionLabel}>Platform</Text>
        <View style={styles.chipRow}>
          <Chip label="All" active={filters.platform === ''} onPress={() => setFilter({ platform: '' })} />
          {PLATFORMS.map((p) => (
            <Chip
              key={p}
              label={p}
              active={filters.platform === p}
              onPress={() => setFilter({ platform: filters.platform === p ? '' : p })}
            />
          ))}
        </View>

        {/* Status */}
        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.chipRow}>
          <Chip label="Any" active={filters.status === ''} onPress={() => setFilter({ status: '' })} />
          {STATUSES.map((s) => (
            <Chip
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              active={filters.status === s}
              onPress={() => setFilter({ status: filters.status === s ? '' : s })}
            />
          ))}
        </View>

        {/* Sort */}
        <Text style={styles.sectionLabel}>Sort By</Text>
        <View style={styles.chipRow}>
          {SORTS.map(({ key, label }) => (
            <Chip
              key={key}
              label={label}
              active={filters.sort === key}
              onPress={() => setFilter({ sort: key })}
            />
          ))}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
});

FilterSheet.displayName = 'FilterSheet';
export default FilterSheet;

// ── Chip sub-component ────────────────────────────────────────────────────────
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  heading: { color: colors.text, fontSize: 17, fontWeight: '700', marginVertical: spacing.md },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginTop: spacing.md, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 12 },
  chipTextActive: { color: colors.bg, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  resetBtn: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  resetBtnText: { color: colors.muted },
  applyBtn: { flex: 2, paddingVertical: spacing.sm + 2, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center' },
  applyBtnText: { color: colors.bg, fontWeight: '700' },
});
