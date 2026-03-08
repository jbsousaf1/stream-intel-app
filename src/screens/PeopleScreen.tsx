// src/screens/PeopleScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  getTrendingActors,
  searchActors,
} from '../services/friendsService';
import { TMDB_IMG_W185 } from '../constants/api';
import { colors, spacing, radius } from '../constants/theme';
import type { HomeStackParamList } from '../navigation/types';
import type { Actor } from '../services/friendsService';

type Props = NativeStackScreenProps<HomeStackParamList, 'People'>;

const { width } = Dimensions.get('window');
const CARD_W = (width - spacing.lg * 2 - spacing.sm * 2) / 3;

export default function PeopleScreen({ navigation }: Props) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const isSearchMode = query.trim().length >= 2;

  const loadTrending = useCallback(async (pg = 1) => {
    setIsLoading(true);
    try {
      const res = await getTrendingActors(pg);
      setActors((prev) => pg === 1 ? res.results : [...prev, ...res.results]);
      setHasMore(pg < res.total_pages);
      setPage(pg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSearch = useCallback(async (q: string, pg = 1) => {
    setIsLoading(true);
    try {
      const res = await searchActors(q, pg);
      setActors((prev) => pg === 1 ? res.results : [...prev, ...res.results]);
      setHasMore(pg < res.total_pages);
      setPage(pg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadTrending(1); }, [loadTrending]);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      clearTimeout(searchTimeout.current);
      if (text.length >= 2) {
        searchTimeout.current = setTimeout(() => { setPage(1); loadSearch(text, 1); }, 400);
      } else if (text.length === 0) {
        setPage(1);
        loadTrending(1);
      }
    },
    [loadSearch, loadTrending],
  );

  const onEndReached = useCallback(() => {
    if (!isLoading && hasMore) {
      const next = page + 1;
      if (isSearchMode) loadSearch(query, next);
      else loadTrending(next);
    }
  }, [isLoading, hasMore, page, isSearchMode, query, loadSearch, loadTrending]);

  const renderActor = ({ item }: { item: Actor }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.push('ActorDetail', { personId: item.id, name: item.name })}
      activeOpacity={0.8}
    >
      <FastImage
        style={styles.photo}
        source={item.profile_path ? { uri: `${TMDB_IMG_W185}${item.profile_path}` } : require('../assets/placeholder_actor.png')}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder="Search actors…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <MaterialIcons name="close" size={16} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>{isSearchMode ? 'Results' : 'Trending'}</Text>

      {isLoading && actors.length === 0 ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>
      ) : (
        <FlatList
          data={actors}
          keyExtractor={(a) => String(a.id)}
          renderItem={renderActor}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={() =>
            isLoading ? <ActivityIndicator style={{ padding: spacing.md }} color={colors.accent} /> : null
          }
          removeClippedSubviews
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, margin: spacing.md, borderRadius: 20, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 1, gap: spacing.xs },
  input: { flex: 1, color: colors.text, fontSize: 14, padding: 0 },
  sectionTitle: { color: colors.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  columnWrapper: { gap: spacing.sm, marginBottom: spacing.sm },
  card: { width: CARD_W, alignItems: 'center' },
  photo: { width: CARD_W, height: CARD_W * 1.3, borderRadius: radius.md, marginBottom: spacing.xs },
  name: { color: colors.text, fontSize: 11, textAlign: 'center' },
});
