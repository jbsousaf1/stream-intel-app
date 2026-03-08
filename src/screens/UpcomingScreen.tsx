// src/screens/UpcomingScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getUpcoming } from '../services/titlesService';
import { TMDB_IMG_W185 } from '../constants/api';
import PlatformBadge from '../components/PlatformBadge';
import { colors, spacing, radius } from '../constants/theme';
import type { UpcomingEpisode, ShowData } from '../services/titlesService';

interface GroupedShow {
  showData: ShowData;
  episodes: UpcomingEpisode[];
}

export default function UpcomingScreen() {
  const insets = useSafeAreaInsets();
  const [grouped, setGrouped] = useState<GroupedShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getUpcoming();
      // Group by show
      const map = new Map<string, GroupedShow>();
      for (const ep of res.episodes) {
        const key = `${ep.platform}|${ep.title}`;
        if (!map.has(key)) {
          const showData = res.show_data?.[key] ?? { poster_path: null, platform: ep.platform };
          map.set(key, { showData, episodes: [] });
        }
        map.get(key)!.episodes.push(ep);
      }
      setGrouped([...map.values()].sort((a, b) => {
        const dateA = a.episodes[0]?.air_date ?? '';
        const dateB = b.episodes[0]?.air_date ?? '';
        return dateA.localeCompare(dateB);
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load upcoming');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <FlatList
      style={[styles.container, { paddingTop: insets.top }]}
      data={grouped}
      keyExtractor={(g) => `${g.showData.platform}|${g.episodes[0]?.title}`}
      contentContainerStyle={styles.list}
      renderItem={({ item: g }) => {
        const firstEp = g.episodes[0];
        const posterUri = g.showData.poster_path
          ? { uri: `${TMDB_IMG_W185}${g.showData.poster_path}` }
          : require('../assets/placeholder_poster.png');

        return (
          <View style={styles.card}>
            <FastImage style={styles.poster} source={posterUri} resizeMode={FastImage.resizeMode.cover} />
            <View style={styles.info}>
              <Text style={styles.showTitle} numberOfLines={2}>{firstEp?.title}</Text>
              <PlatformBadge platform={g.showData.platform} small />
              {g.episodes.map((ep) => (
                <View key={`${ep.season}-${ep.episode}`} style={styles.epRow}>
                  <Text style={styles.epLabel}>S{ep.season}E{ep.episode}</Text>
                  {ep.episode_title ? <Text style={styles.epTitle} numberOfLines={1}>{ep.episode_title}</Text> : null}
                  <Text style={styles.airDate}>{ep.air_date}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>No upcoming episodes for your library.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, paddingTop: spacing.xl },
  list: { padding: spacing.md },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, marginBottom: spacing.sm, overflow: 'hidden' },
  poster: { width: 68, height: 95 },
  info: { flex: 1, padding: spacing.sm, gap: 3 },
  showTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  epRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  epLabel: { color: colors.accent, fontSize: 11, fontWeight: '700', width: 48 },
  epTitle: { flex: 1, color: colors.muted, fontSize: 11 },
  airDate: { color: colors.muted, fontSize: 10 },
  empty: { color: colors.muted },
  errorText: { color: '#f87171' },
});
