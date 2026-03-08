// src/screens/NotificationsScreen.tsx
import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotifications } from '../hooks/useNotifications';
import { colors, spacing, radius } from '../constants/theme';
import type { Notification } from '../services/friendsService';

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function notifText(n: Notification): string {
  const actor = n.actor_name || n.actor_username;
  switch (n.type) {
    case 'friend_request': return `${actor} sent you a friend request.`;
    case 'friend_accepted': return `${actor} accepted your friend request.`;
    case 'shared_action': {
      const p = n.payload as Record<string, unknown>;
      return `${actor} shared "${p.title}" with you.`;
    }
    case 'title_message': {
      const p = n.payload as Record<string, unknown>;
      return `${actor} sent a message about "${p.title}": ${p.message}`;
    }
    default: return 'New notification.';
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, hasMore, isLoading, load, loadMore, markRead } = useNotifications();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(() => load(true), [load]);

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.row, !item.is_read && styles.rowUnread]}
      onPress={() => !item.is_read && markRead(item.id)}
      activeOpacity={0.8}
    >
      <FastImage
        style={styles.avatar}
        source={item.actor_pic ? { uri: item.actor_pic } : require('../assets/placeholder_avatar.png')}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.rowContent}>
        <Text style={styles.notifText}>{notifText(item)}</Text>
        <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Mark all read */}
      {unreadCount > 0 ? (
        <TouchableOpacity style={styles.markAll} onPress={() => markRead()}>
          <Text style={styles.markAllText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      ) : null}

      {isLoading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => String(n.id)}
          renderItem={renderItem}
          onEndReached={() => hasMore && loadMore()}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No notifications yet.</Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xl },
  markAll: { padding: spacing.md, alignItems: 'flex-end' },
  markAllText: { color: colors.accent, fontSize: 13 },
  list: { paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  rowUnread: { backgroundColor: `${colors.accent}11` },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card },
  rowContent: { flex: 1 },
  notifText: { color: colors.text, fontSize: 13, lineHeight: 18 },
  time: { color: colors.muted, fontSize: 11, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  empty: { color: colors.muted },
});
