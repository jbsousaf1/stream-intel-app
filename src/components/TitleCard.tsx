// src/components/TitleCard.tsx
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

import { colors, spacing, radius } from '../constants/theme';
import { TMDB_IMG_W185 } from '../constants/api';
import PlatformBadge from './PlatformBadge';
import ScoreBlock from './ScoreBlock';
import type { Title } from '../services/titlesService';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.lg * 2 - spacing.sm) / 2;
const POSTER_HEIGHT = CARD_WIDTH * 1.5;

interface Props {
  title: Title;
  isFav?: boolean;
  status?: string | null;
  onPress: (title: Title) => void;
  onLongPress?: (title: Title) => void;
}

function TitleCard({ title, isFav, status, onPress, onLongPress }: Props) {
  const posterUri = title.poster_path
    ? { uri: `${TMDB_IMG_W185}${title.poster_path}` }
    : require('../assets/placeholder_poster.png');

  const handlePress = useCallback(() => onPress(title), [onPress, title]);
  const handleLongPress = useCallback(() => onLongPress?.(title), [onLongPress, title]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <FastImage
        style={styles.poster}
        source={posterUri}
        resizeMode={FastImage.resizeMode.cover}
      />

      {/* Badges overlay */}
      <View style={styles.topRow}>
        <PlatformBadge platform={title.platform} small />
        {isFav ? <Text style={styles.fav}>♥</Text> : null}
      </View>

      {/* Status pill */}
      {status ? (
        <View style={[styles.statusPill, { backgroundColor: statusColor(status) }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}

      <View style={styles.info}>
        <Text style={styles.titleText} numberOfLines={2}>
          {title.title}
        </Text>
        <Text style={styles.year}>{title.release_year}</Text>
        <ScoreBlock imdb={title.imdb_score} rt={title.tomatometer} size="sm" />
      </View>
    </TouchableOpacity>
  );
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    watching: '#5eead4',
    completed: '#4ade80',
    planned: '#818cf8',
    paused: '#facc15',
    dropped: '#f87171',
  };
  return map[status.toLowerCase()] ?? colors.muted;
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  poster: { width: CARD_WIDTH, height: POSTER_HEIGHT },
  topRow: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fav: { color: colors.accent2, fontSize: 14 },
  statusPill: {
    position: 'absolute',
    bottom: POSTER_HEIGHT - 18,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  statusText: { color: colors.bg, fontSize: 9, fontWeight: '700' },
  info: { padding: spacing.xs + 2 },
  titleText: { color: colors.text, fontSize: 12, fontWeight: '600', marginBottom: 2 },
  year: { color: colors.muted, fontSize: 10, marginBottom: spacing.xs },
});

export default memo(TitleCard);
