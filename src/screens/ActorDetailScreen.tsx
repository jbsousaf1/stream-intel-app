// src/screens/ActorDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getActorDetail } from '../services/friendsService';
import { TMDB_IMG_W500, TMDB_IMG_W185 } from '../constants/api';
import { colors, spacing, radius } from '../constants/theme';
import type { HomeStackParamList } from '../navigation/types';
import type { ActorDetail } from '../services/friendsService';

type Props = NativeStackScreenProps<HomeStackParamList, 'ActorDetail'>;

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width * 0.36;

export default function ActorDetailScreen({ route, navigation }: Props) {
  const { personId, name } = route.params;
  const [actor, setActor] = useState<ActorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    getActorDetail(personId)
      .then(setActor)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [personId]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (error || !actor) {
    return <View style={styles.center}><Text style={styles.errorText}>{error ?? 'Not found'}</Text></View>;
  }

  const photoUri = actor.profile_path
    ? { uri: `${TMDB_IMG_W500}${actor.profile_path}` }
    : require('../assets/placeholder_actor.png');

  const bio = actor.biography ?? '';
  const shortBio = bio.slice(0, 300);

  // Sort credits by date desc
  const credits = [...actor.credits].sort((a, b) => {
    const da = a.release_date || a.first_air_date || '';
    const db = b.release_date || b.first_air_date || '';
    return db.localeCompare(da);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <FastImage style={styles.photo} source={photoUri} resizeMode={FastImage.resizeMode.cover} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{actor.name}</Text>
          <Text style={styles.dept}>{actor.known_for_department}</Text>
          {actor.birthday ? <Text style={styles.meta}>Born: {actor.birthday}</Text> : null}
          {actor.place_of_birth ? <Text style={styles.meta}>{actor.place_of_birth}</Text> : null}
        </View>
      </View>

      {/* Bio */}
      {bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biography</Text>
          <Text style={styles.bio}>
            {bioExpanded ? bio : shortBio}{!bioExpanded && bio.length > 300 ? '…' : ''}
          </Text>
          {bio.length > 300 ? (
            <TouchableOpacity onPress={() => setBioExpanded((v) => !v)}>
              <Text style={styles.readMore}>{bioExpanded ? 'Show less' : 'Read more'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Credits */}
      {credits.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Known For</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {credits.slice(0, 20).map((c, i) => {
              const creditTitle = c.title || c.name || 'Untitled';
              const posterUri = c.poster_path
                ? { uri: `${TMDB_IMG_W185}${c.poster_path}` }
                : require('../assets/placeholder_poster.png');
              return (
                <View key={i} style={styles.creditCard}>
                  <FastImage style={styles.creditPoster} source={posterUri} resizeMode={FastImage.resizeMode.cover} />
                  <Text style={styles.creditTitle} numberOfLines={2}>{creditTitle}</Text>
                  {c.character ? <Text style={styles.creditChar} numberOfLines={1}>{c.character}</Text> : null}
                  {c.release_date || c.first_air_date ? (
                    <Text style={styles.creditYear}>
                      {(c.release_date || c.first_air_date || '').slice(0, 4)}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xl * 2 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#f87171' },
  header: { flexDirection: 'row', padding: spacing.md, gap: spacing.md },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE * 1.3, borderRadius: radius.md },
  headerInfo: { flex: 1, paddingTop: spacing.xs },
  name: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs },
  dept: { color: colors.accent, fontSize: 12, marginBottom: spacing.xs },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  section: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  bio: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  readMore: { color: colors.accent, fontSize: 12, marginTop: spacing.xs },
  creditCard: { width: 90, marginRight: spacing.sm },
  creditPoster: { width: 90, height: 120, borderRadius: radius.sm, marginBottom: spacing.xs },
  creditTitle: { color: colors.text, fontSize: 11, fontWeight: '600' },
  creditChar: { color: colors.muted, fontSize: 10, marginTop: 1 },
  creditYear: { color: colors.muted, fontSize: 10 },
});
