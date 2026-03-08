// src/screens/ProfileScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { colors, spacing, radius } from '../constants/theme';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { profile, watchtimeTitles, isLoading, load } = useProfile();
  const logout = useAuthStore((s) => s.logout);
  const reset = useLibraryStore((s) => s.reset);

  useEffect(() => { load(); }, [load]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          reset();
          await logout();
        },
      },
    ]);
  };

  if (isLoading && !profile) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  const stats = profile?.stats;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <FastImage
          style={styles.avatar}
          source={profile?.profile_pic ? { uri: profile.profile_pic } : require('../assets/placeholder_avatar.png')}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile?.display_name || profile?.username}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.push('EditProfile')}>
          <MaterialIcons name="edit" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      {stats ? (
        <View style={styles.statsRow}>
          <StatChip label="Movies" value={stats.movies} />
          <StatChip label="Shows" value={stats.shows} />
          <StatChip label="Favourites" value={stats.favs} />
          <StatChip label="Hours" value={Math.round(stats.watch_time?.total_hours ?? 0)} />
        </View>
      ) : null}

      {/* Top genres */}
      {stats?.top_genres && stats.top_genres.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Genres</Text>
          <View style={styles.genreRow}>
            {stats.top_genres.slice(0, 5).map((g) => (
              <View key={g.genre} style={styles.genreChip}>
                <Text style={styles.genreText}>{g.genre}</Text>
                <Text style={styles.genreCount}>{g.count}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Watch time titles */}
      {watchtimeTitles.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Watched</Text>
          {watchtimeTitles.slice(0, 5).map((t, i) => (
            <View key={i} style={styles.watchtimeRow}>
              <Text style={styles.watchtimeRank}>#{i + 1}</Text>
              <Text style={styles.watchtimeTitle} numberOfLines={1}>{t.title}</Text>
              <Text style={styles.watchtimeHours}>{t.hours}h</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Quick links */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.push('Upcoming')}>
          <MaterialIcons name="upcoming" size={20} color={colors.accent} />
          <Text style={styles.menuLabel}>Upcoming Episodes</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialIcons name="logout" size={18} color="#f87171" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
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
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.card },
  headerInfo: { flex: 1 },
  name: { color: colors.text, fontSize: 18, fontWeight: '700' },
  username: { color: colors.muted, fontSize: 13 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  chip: { alignItems: 'center' },
  chipValue: { color: colors.text, fontSize: 20, fontWeight: '700' },
  chipLabel: { color: colors.muted, fontSize: 11 },
  section: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  genreChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: 4 },
  genreText: { color: colors.text, fontSize: 12 },
  genreCount: { color: colors.muted, fontSize: 11 },
  watchtimeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  watchtimeRank: { color: colors.muted, fontSize: 12, width: 24 },
  watchtimeTitle: { flex: 1, color: colors.text, fontSize: 13 },
  watchtimeHours: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  menuLabel: { flex: 1, color: colors.text, fontSize: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', margin: spacing.lg, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: '#f87171', gap: spacing.sm },
  logoutText: { color: '#f87171', fontWeight: '600' },
});
