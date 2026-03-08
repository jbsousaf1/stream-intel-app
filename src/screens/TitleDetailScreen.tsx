// src/screens/TitleDetailScreen.tsx
/**
 * Full-page title detail view.
 * Shows poster, scores, platform links, library controls (fav + status),
 * episode watch-tracker (shows only), share action, actors.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius } from '../constants/theme';
import { TMDB_IMG_W500, TMDB_IMG_W185 } from '../constants/api';
import ScoreBlock from '../components/ScoreBlock';
import PlatformBadge from '../components/PlatformBadge';
import { useTitlesStore } from '../store/titlesStore';
import { useLibraryStore } from '../store/libraryStore';
import { useAuthStore } from '../store/authStore';
import { libraryKey } from '../services/libraryService';
import { getFriends, shareAction } from '../services/friendsService';
import type { HomeStackParamList } from '../navigation/types';
import type { Title } from '../services/titlesService';
import type { FriendUser } from '../services/friendsService';

type Props = NativeStackScreenProps<HomeStackParamList, 'TitleDetail'>;

const { width } = Dimensions.get('window');
const POSTER_W = width * 0.38;
const POSTER_H = POSTER_W * 1.5;

const STATUSES = ['watching', 'completed', 'planned', 'paused', 'dropped'];

export default function TitleDetailScreen({ route, navigation }: Props) {
  const { platform, title: titleStr, contentType } = route.params;
  const insets = useSafeAreaInsets();

  const titles = useTitlesStore((s) => s.titles);
  const title: Title | undefined = titles.find(
    (t) => t.platform === platform && t.title === titleStr,
  );

  const libraryMap = useLibraryStore((s) => s.libraryMap);
  const updateEntry = useLibraryStore((s) => s.updateEntry);
  const watched = useLibraryStore((s) => s.watched);
  const addWatched = useLibraryStore((s) => s.addWatched);
  const removeWatched = useLibraryStore((s) => s.removeWatched);

  const user = useAuthStore((s) => s.user);

  const entry = libraryMap[libraryKey(platform, titleStr)];
  const isFav = entry?.is_fav ?? false;
  const currentStatus = entry?.status ?? null;

  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [shareMessage, setShareMessage] = useState('');
  const [isSharingLoading, setIsSharingLoading] = useState(false);

  // Season/episode tracker state (only for shows)
  const [currentSeason, setCurrentSeason] = useState(1);
  const maxSeasons = title?.seasons ?? 1;
  const maxEps = title?.episodes_per_season?.[currentSeason] ?? 12;

  useEffect(() => {
    if (showShareModal) {
      getFriends().then(setFriends).catch(() => {});
    }
  }, [showShareModal]);

  const toggleFav = useCallback(async () => {
    try {
      await updateEntry(platform, titleStr, { is_fav: !isFav });
    } catch {
      Alert.alert('Error', 'Could not update favourite.');
    }
  }, [platform, titleStr, isFav, updateEntry]);

  const setStatus = useCallback(
    async (status: string | null) => {
      setShowStatusPicker(false);
      try {
        await updateEntry(platform, titleStr, { status });
      } catch {
        Alert.alert('Error', 'Could not update status.');
      }
    },
    [platform, titleStr, updateEntry],
  );

  const isWatched = useCallback(
    (season: number, ep: number) =>
      watched.some(
        (w) =>
          w.platform === platform && w.title === titleStr && w.season === season && w.episode === ep,
      ),
    [watched, platform, titleStr],
  );

  const toggleEpisode = useCallback(
    async (season: number, ep: number) => {
      if (isWatched(season, ep)) {
        await removeWatched(platform, titleStr, season, ep);
      } else {
        await addWatched(platform, titleStr, season, ep);
      }
    },
    [isWatched, addWatched, removeWatched, platform, titleStr],
  );

  const handleShare = useCallback(async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Select friends', 'Please select at least one friend to share with.');
      return;
    }
    setIsSharingLoading(true);
    try {
      await shareAction(selectedFriends, {
        type: shareMessage ? 'title_message' : 'shared_action',
        title: titleStr,
        platform,
        status: currentStatus ?? undefined,
        is_fav: isFav,
        message: shareMessage || undefined,
      });
      setShowShareModal(false);
      setSelectedFriends([]);
      setShareMessage('');
      Alert.alert('Shared!', `Sent to ${selectedFriends.length} friend(s).`);
    } catch {
      Alert.alert('Error', 'Could not share.');
    } finally {
      setIsSharingLoading(false);
    }
  }, [selectedFriends, titleStr, platform, currentStatus, isFav, shareMessage]);

  if (!title) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const posterUri = title.poster_path
    ? { uri: `${TMDB_IMG_W500}${title.poster_path}` }
    : require('../assets/placeholder_poster.png');

  const genres = title.genres ?? [];
  const platformUrls = title.platform_urls ?? {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
      {/* Hero */}
      <View style={styles.hero}>
        <FastImage style={styles.poster} source={posterUri} resizeMode={FastImage.resizeMode.cover} />
        <View style={styles.heroInfo}>
          <Text style={styles.titleText}>{title.title}</Text>
          <Text style={styles.meta}>{title.release_year} · {contentType === 'show' ? 'TV Show' : 'Movie'}</Text>
          {title.runtime ? <Text style={styles.meta}>{title.runtime} min{contentType === 'show' ? '/ep' : ''}</Text> : null}
          <PlatformBadge platform={platform} />
          <View style={{ marginTop: spacing.xs }}>
            <ScoreBlock imdb={title.imdb_score} rt={title.tomatometer} />
          </View>
          {genres.length > 0 && (
            <Text style={styles.genres} numberOfLines={2}>{genres.join(', ')}</Text>
          )}
        </View>
      </View>

      {/* Library actions */}
      <View style={styles.actionRow}>
        {/* Favourite */}
        <TouchableOpacity style={styles.iconBtn} onPress={toggleFav}>
          <MaterialIcons name={isFav ? 'favorite' : 'favorite-border'} size={22} color={isFav ? colors.accent2 : colors.muted} />
          <Text style={styles.iconLabel}>{isFav ? 'Faved' : 'Fav'}</Text>
        </TouchableOpacity>

        {/* Status */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowStatusPicker(true)}>
          <MaterialIcons name="label" size={22} color={currentStatus ? colors.accent : colors.muted} />
          <Text style={styles.iconLabel}>{currentStatus ? currentStatus : 'Status'}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowShareModal(true)}>
          <MaterialIcons name="share" size={22} color={colors.muted} />
          <Text style={styles.iconLabel}>Share</Text>
        </TouchableOpacity>

        {/* Open streaming link */}
        {Object.keys(platformUrls).length > 0 ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              // Linking handled natively; open first available URL
              const firstUrl = Object.values(platformUrls)[0];
              if (firstUrl) {
                const { Linking } = require('react-native');
                Linking.openURL(firstUrl).catch(() =>
                  Alert.alert('Error', 'Cannot open streaming link.'),
                );
              }
            }}
          >
            <MaterialIcons name="play-circle-outline" size={22} color={colors.accent} />
            <Text style={styles.iconLabel}>Watch</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Overview */}
      {title.overview ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>{title.overview}</Text>
        </View>
      ) : null}

      {/* Episode tracker (shows only) */}
      {contentType === 'show' && maxSeasons >= 1 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Episodes</Text>
          {/* Season picker */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
            {Array.from({ length: maxSeasons }, (_, i) => i + 1).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setCurrentSeason(s)}
                style={[styles.seasonChip, s === currentSeason && styles.seasonChipActive]}
              >
                <Text style={[styles.seasonChipText, s === currentSeason && styles.seasonChipTextActive]}>S{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Episode grid */}
          <View style={styles.episodeGrid}>
            {Array.from({ length: maxEps }, (_, i) => i + 1).map((ep) => {
              const done = isWatched(currentSeason, ep);
              return (
                <TouchableOpacity
                  key={ep}
                  onPress={() => toggleEpisode(currentSeason, ep)}
                  style={[styles.epDot, done && styles.epDotDone]}
                >
                  <Text style={[styles.epDotText, done && styles.epDotTextDone]}>{ep}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Actors (if populated) */}
      {title.cast && title.cast.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {title.cast.map((actor) => (
              <TouchableOpacity
                key={actor.id}
                style={styles.actorCard}
                onPress={() => navigation.push('ActorDetail', { personId: actor.id, name: actor.name })}
              >
                <FastImage
                  style={styles.actorImg}
                  source={actor.profile_path ? { uri: `${TMDB_IMG_W185}${actor.profile_path}` } : require('../assets/placeholder_actor.png')}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <Text style={styles.actorName} numberOfLines={2}>{actor.name}</Text>
                <Text style={styles.actorChar} numberOfLines={1}>{actor.character}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* ── Status picker modal ──────────────────────────────────────────────── */}
      <Modal visible={showStatusPicker} transparent animationType="slide" onRequestClose={() => setShowStatusPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Set Status</Text>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.pickerRow, s === currentStatus && styles.pickerRowActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.pickerRowText, s === currentStatus && { color: colors.accent }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
                {s === currentStatus ? <MaterialIcons name="check" size={16} color={colors.accent} /> : null}
              </TouchableOpacity>
            ))}
            {currentStatus ? (
              <TouchableOpacity style={styles.pickerRow} onPress={() => setStatus(null)}>
                <Text style={[styles.pickerRowText, { color: '#f87171' }]}>Remove Status</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Share modal ──────────────────────────────────────────────────────── */}
      <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowShareModal(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Share "{titleStr}"</Text>
            {friends.length === 0 ? (
              <Text style={styles.mutedCenter}>No friends yet. Add some!</Text>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(f) => String(f.id)}
                renderItem={({ item }) => {
                  const sel = selectedFriends.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={[styles.pickerRow, sel && styles.pickerRowActive]}
                      onPress={() =>
                        setSelectedFriends((prev) =>
                          sel ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                        )
                      }
                    >
                      <Text style={styles.pickerRowText}>{item.display_name || item.username}</Text>
                      {sel ? <MaterialIcons name="check" size={16} color={colors.accent} /> : null}
                    </TouchableOpacity>
                  );
                }}
                scrollEnabled={false}
              />
            )}
            <TouchableOpacity
              style={[styles.actionBtn, isSharingLoading && { opacity: 0.6 }]}
              onPress={handleShare}
              disabled={isSharingLoading}
            >
              {isSharingLoading ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.actionBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', padding: spacing.md, gap: spacing.md },
  poster: { width: POSTER_W, height: POSTER_H, borderRadius: radius.md },
  heroInfo: { flex: 1, paddingTop: spacing.xs },
  titleText: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs },
  meta: { color: colors.muted, fontSize: 12, marginBottom: 2 },
  genres: { color: colors.muted, fontSize: 11, marginTop: spacing.xs },
  actionRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.lg },
  iconBtn: { alignItems: 'center', gap: 2 },
  iconLabel: { color: colors.muted, fontSize: 10 },
  section: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  overviewText: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  seasonChip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs, backgroundColor: colors.card },
  seasonChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  seasonChipText: { color: colors.muted, fontSize: 12 },
  seasonChipTextActive: { color: colors.bg, fontWeight: '700' },
  episodeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  epDot: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  epDotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  epDotText: { color: colors.muted, fontSize: 11 },
  epDotTextDone: { color: colors.bg, fontWeight: '700' },
  actorCard: { width: 76, marginRight: spacing.sm },
  actorImg: { width: 76, height: 100, borderRadius: radius.sm, marginBottom: spacing.xs },
  actorName: { color: colors.text, fontSize: 11, fontWeight: '600' },
  actorChar: { color: colors.muted, fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, paddingBottom: spacing.xl },
  pickerTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  pickerRowActive: { opacity: 1 },
  pickerRowText: { color: colors.text, fontSize: 14 },
  mutedCenter: { color: colors.muted, textAlign: 'center', marginVertical: spacing.md },
  actionBtn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: spacing.sm + 2, alignItems: 'center', marginTop: spacing.md },
  actionBtnText: { color: colors.bg, fontWeight: '700' },
});
