// src/screens/FriendLibraryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getFriendLibrary } from '../services/friendsService';
import PlatformBadge from '../components/PlatformBadge';
import { colors, spacing, radius } from '../constants/theme';
import type { FriendsStackParamList } from '../navigation/types';
import type { FriendLibraryEntry } from '../services/friendsService';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendLibrary'>;

const STATUS_TABS = ['all', 'watching', 'completed', 'planned', 'paused', 'dropped', 'fav'] as const;
type Tab = (typeof STATUS_TABS)[number];

export default function FriendLibraryScreen({ route }: Props) {
  const { userId, displayName } = route.params;
  const [library, setLibrary] = useState<FriendLibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFriendLibrary(userId)
      .then(setLibrary)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const filtered = library.filter((e) => {
    if (tab === 'fav') return e.is_fav;
    if (tab === 'all') return true;
    return e.status === tab;
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{displayName}'s Library</Text>

      {/* Tabs */}
      <FlatList
        horizontal
        data={STATUS_TABS}
        keyExtractor={(t) => t}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
        renderItem={({ item: t }) => (
          <TouchableOpacity
            style={[styles.tab, t === tab && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, t === tab && styles.tabTextActive]}>
              {t === 'fav' ? '♥' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        style={{ flexGrow: 0, marginBottom: spacing.sm }}
      />

      {filtered.length === 0 ? (
        <View style={styles.center}><Text style={styles.empty}>No entries.</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => `${e.platform}|${e.title}`}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
                <View style={styles.rowMeta}>
                  <PlatformBadge platform={item.platform} small />
                  <Text style={styles.year}>{item.release_year}</Text>
                  {item.is_fav ? <Text style={styles.fav}>♥</Text> : null}
                </View>
              </View>
              {item.status ? (
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              ) : null}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { color: colors.text, fontSize: 17, fontWeight: '700', padding: spacing.md },
  tabList: { paddingHorizontal: spacing.md, gap: spacing.xs },
  tab: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 12 },
  tabTextActive: { color: colors.bg, fontWeight: '700' },
  list: { paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  rowInfo: { flex: 1 },
  titleText: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  year: { color: colors.muted, fontSize: 11 },
  fav: { color: colors.accent2, fontSize: 12 },
  statusPill: { backgroundColor: colors.card, borderRadius: radius.xs, paddingHorizontal: spacing.xs, paddingVertical: 2 },
  statusText: { color: colors.accent, fontSize: 11 },
  empty: { color: colors.muted },
  errorText: { color: '#f87171' },
});
