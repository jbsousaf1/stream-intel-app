// src/screens/LibraryScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLibraryStore } from '../store/libraryStore';
import { useTitlesStore } from '../store/titlesStore';
import { libraryKey } from '../services/libraryService';
import TitleCard from '../components/TitleCard';
import { colors, spacing } from '../constants/theme';
import type { LibraryStackParamList } from '../navigation/types';
import type { Title } from '../services/titlesService';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Library'>;

const STATUS_TABS = ['all', 'watching', 'completed', 'planned', 'paused', 'dropped', 'fav'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function LibraryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const libraryMap = useLibraryStore((s) => s.libraryMap);
  const isLoading = useLibraryStore((s) => s.isLoading);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const allTitles = useTitlesStore((s) => s.titles);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLibrary();
    setRefreshing(false);
  }, [loadLibrary]);

  // Build list of titles that have a library entry
  const libraryTitles: Title[] = useMemo(() => {
    const result: Title[] = [];
    for (const t of allTitles) {
      const key = libraryKey(t.platform, t.title);
      const entry = libraryMap[key];
      if (!entry) continue;

      // Filter by tab
      if (tab === 'fav' && !entry.is_fav) continue;
      if (tab !== 'all' && tab !== 'fav' && entry.status !== tab) continue;

      // Filter by search
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) continue;

      result.push(t);
    }
    return result;
  }, [allTitles, libraryMap, tab, search]);

  const handlePress = useCallback(
    (t: Title) => {
      navigation.push('TitleDetail', {
        platform: t.platform,
        title: t.title,
        contentType: t.content_type as 'movie' | 'show',
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
          onPress={handlePress}
        />
      );
    },
    [libraryMap, handlePress],
  );

  if (isLoading && Object.keys(libraryMap).length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search */}
      <View style={styles.searchWrapper}>
        <MaterialIcons name="search" size={16} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search library…"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={14} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status tabs */}
      <FlatList
        horizontal
        data={STATUS_TABS}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
        renderItem={({ item: t }) => (
          <TouchableOpacity
            style={[styles.tab, t === tab && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, t === tab && styles.tabTextActive]}>
              {t === 'fav' ? '♥ Fav' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.tabBar}
      />

      <Text style={styles.count}>{libraryTitles.length} titles</Text>

      {libraryTitles.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {tab === 'all' ? 'Your library is empty.' : `No ${tab} titles yet.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={libraryTitles}
          renderItem={renderItem}
          keyExtractor={(t) => libraryKey(t.platform, t.title)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          removeClippedSubviews
          windowSize={10}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: 20,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    gap: spacing.xs,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, padding: 0 },
  tabBar: { flexGrow: 0 },
  tabList: { paddingHorizontal: spacing.md, gap: spacing.xs, paddingBottom: spacing.xs },
  tab: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 12 },
  tabTextActive: { color: colors.bg, fontWeight: '700' },
  count: { color: colors.muted, fontSize: 11, paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.xs },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  columnWrapper: { justifyContent: 'space-between' },
  emptyText: { color: colors.muted },
});
