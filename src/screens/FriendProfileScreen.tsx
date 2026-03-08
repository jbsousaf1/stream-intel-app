// src/screens/FriendProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getFriendProfile } from '../services/friendsService';
import { colors, spacing, radius } from '../constants/theme';
import type { FriendsStackParamList } from '../navigation/types';
import type { FriendProfile } from '../services/friendsService';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendProfile'>;

export default function FriendProfileScreen({ route, navigation }: Props) {
  const { userId, displayName } = route.params;
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFriendProfile(userId)
      .then(setProfile)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (error || !profile) {
    return <View style={styles.center}><Text style={styles.errorText}>{error ?? 'Not found'}</Text></View>;
  }

  const stats = profile.stats;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar + name */}
      <View style={styles.header}>
        <FastImage
          style={styles.avatar}
          source={profile.profile_pic ? { uri: profile.profile_pic } : require('../assets/placeholder_avatar.png')}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text style={styles.name}>{profile.display_name || profile.username}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
      </View>

      {/* Stats */}
      {stats ? (
        <View style={styles.statsRow}>
          <StatChip label="Movies" value={stats.movies} />
          <StatChip label="Shows" value={stats.shows} />
          <StatChip label="Hours" value={Math.round((stats.watch_time?.total_hours ?? 0))} />
        </View>
      ) : null}

      {/* View library button */}
      {profile.library_public ? (
        <TouchableOpacity
          style={styles.viewLibBtn}
          onPress={() => navigation.push('FriendLibrary', { userId, displayName: profile.display_name || profile.username })}
        >
          <Text style={styles.viewLibBtnText}>View Library</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.privateText}>This user's library is private.</Text>
      )}
    </ScrollView>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipValue}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xl * 2 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#f87171' },
  header: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.card, marginBottom: spacing.sm },
  name: { color: colors.text, fontSize: 20, fontWeight: '700' },
  username: { color: colors.muted, fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  chip: { alignItems: 'center' },
  chipValue: { color: colors.text, fontSize: 22, fontWeight: '700' },
  chipLabel: { color: colors.muted, fontSize: 12 },
  viewLibBtn: { margin: spacing.lg, backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center' },
  viewLibBtnText: { color: colors.bg, fontWeight: '700' },
  privateText: { color: colors.muted, textAlign: 'center', marginTop: spacing.lg },
});
