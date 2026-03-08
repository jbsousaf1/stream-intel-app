// src/screens/HomeScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTitlesStore } from '../store/titlesStore';
import { useLibraryStore } from '../store/libraryStore';
import { libraryKey } from '../services/libraryService';
import TitleCard from '../components/TitleCard';
import FilterSheet from '../components/FilterSheet';
import { colors, spacing } from '../constants/theme';
import type { HomeStackParamList } from '../navigation/types';
import type { Title } from '../services/titlesService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // Store data
  const titles = useTitlesStore((s) => s.titles);
  const isLoading = useTitlesStore((s) => s.isLoading);
  const hasMore = useTitlesStore((s) => s.hasMore);
  const filters = useTitlesStore((s) => s.filters);
  const total = useTitlesStore((s) => s.total);
  const loadTitles = useTitlesStore((s) => s.loadTitles);
  const loadNextPage = useTitlesStore((s) => s.loadNextPage);
  const setFilter = useTitlesStore((s) => s.setFilter);
  const loadRegions = useTitlesStore((s) => s.loadRegions);
  const detectRegion = useTitlesStore((s) => s.detectRegion);
  const loadPlatformLogos = useTitlesStore((s) => s.loadPlatformLogos);

  const libraryMap = useLibraryStore((s) => s.libraryMap);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);

  const [refreshing, setRefreshing] = useState(false);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Initial load
  useEffect(() => {
    loadRegions();
    detectRegion();
    loadPlatformLogos();
    loadLibrary();
    loadTitles(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTitles(true), loadLibrary()]);
    setRefreshing(false);
  }, [loadTitles, loadLibrary]);

  const handleSearch = useCallback(
    (text: string) => {
      setFilter({ searchQuery: text });
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => loadTitles(true), 400);
    },
    [setFilter, loadTitles],
  );

  const handleTitlePress = useCallback(
    (title: Title) => {
      navigation.push('TitleDetail', {
        platform: title.platform,
        title: title.title,
        contentType: title.content_type as 'movie' | 'show',
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Title }) => {
      const key = libraryKey(item.platform, item.title);
      const entry = libraryMap[key];
      return (
        <TitleCard
          title={item}
          isFav={entry?.is_fav}
          status={entry?.status ?? undefined}
          onPress={handleTitlePress}
        />
      );
    },
    [libraryMap, handleTitlePress],
  );

  const keyExtractor = useCallback((item: Title) => `${item.platform}|${item.title}`, []);

  const onEndReached = useCallback(() => {
    if (!isLoading && hasMore) loadNextPage();
  }, [isLoading, hasMore, loadNextPage]);

  const ListFooter = () =>
    isLoading && titles.length > 0 ? (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.accent} />
      </View>
    ) : null;

  const ListEmpty = () =>
    !isLoading ? (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No titles found.</Text>
      </View>
    ) : null;

  const activeFilterCount = [
    filters.contentType !== 'all',
    filters.platform !== '',
    filters.status !== '',
    filters.genre !== '',
    filters.sort !== 'score',
  ].filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search + filter bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search titles…"
            placeholderTextColor={colors.muted}
            value={filters.searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {filters.searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialIcons name="close" size={16} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => filterSheetRef.current?.present()}
        >
          <MaterialIcons name="tune" size={18} color={activeFilterCount > 0 ? colors.bg : colors.accent} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Result count */}
      <Text style={styles.resultCount}>{total} titles</Text>

      {isLoading && titles.length === 0 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={titles}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          removeClippedSubviews
          windowSize={10}
        />
      )}

      <FilterSheet ref={filterSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    gap: spacing.xs,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, padding: 0 },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.accent },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.accent2,
    borderRadius: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  resultCount: { color: colors.muted, fontSize: 11, paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  columnWrapper: { justifyContent: 'space-between' },
  footer: { paddingVertical: spacing.lg, alignItems: 'center' },
  empty: { paddingTop: spacing.xl * 2, alignItems: 'center' },
  emptyText: { color: colors.muted },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
