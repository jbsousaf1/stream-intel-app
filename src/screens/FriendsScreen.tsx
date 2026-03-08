// src/screens/FriendsScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFriends } from '../hooks/useFriends';
import { useNotifications } from '../hooks/useNotifications';
import { colors, spacing, radius } from '../constants/theme';
import type { FriendsStackParamList } from '../navigation/types';
import type { FriendUser } from '../services/friendsService';

type Props = NativeStackScreenProps<FriendsStackParamList, 'Friends'>;

export default function FriendsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { friends, pending, isLoading, load, accept, reject, remove } = useFriends();
  const { unreadCount, load: loadNotifs } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
    loadNotifs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load(), loadNotifs()]);
    setRefreshing(false);
  }, [load, loadNotifs]);

  const handleRemove = useCallback(
    (friend: FriendUser) => {
      Alert.alert(
        'Remove Friend',
        `Remove ${friend.display_name || friend.username} from friends?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => remove(friend.id) },
        ],
      );
    },
    [remove],
  );

  const renderFriend = ({ item }: { item: FriendUser }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.push('FriendProfile', { userId: item.id, displayName: item.display_name || item.username })}
    >
      <FastImage
        style={styles.avatar}
        source={item.profile_pic ? { uri: item.profile_pic } : require('../assets/placeholder_avatar.png')}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.rowInfo}>
        <Text style={styles.displayName}>{item.display_name || item.username}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <MaterialIcons name="person-remove" size={20} color={colors.muted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRequest = ({ item }: { item: typeof pending[number] }) => (
    <View style={[styles.row, styles.requestRow]}>
      <FastImage
        style={styles.avatar}
        source={item.profile_pic ? { uri: item.profile_pic } : require('../assets/placeholder_avatar.png')}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.rowInfo}>
        <Text style={styles.displayName}>{item.display_name || item.username}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <View style={styles.reqBtns}>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => accept(item.id)}>
          <MaterialIcons name="check" size={18} color={colors.bg} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => reject(item.id)}>
          <MaterialIcons name="close" size={18} color={colors.bg} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top action row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.push('SearchUsers')}>
          <MaterialIcons name="person-add" size={18} color={colors.bg} />
          <Text style={styles.actionBtnText}>Find People</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.push('Notifications')}
        >
          <MaterialIcons name="notifications" size={22} color={colors.accent} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {isLoading && friends.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => 'dummy'}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* Pending requests */}
              {pending.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Friend Requests ({pending.length})</Text>
                  {pending.map((r) => (
                    <View key={r.id}>{renderRequest({ item: r })}</View>
                  ))}
                </View>
              )}

              {/* Friends list header */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
              </View>
            </>
          }
          ListEmptyComponent={
            friends.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No friends yet. Search for people to add!</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        />
      )}

      {/* Friends sub-list rendered separately to avoid nested VirtualizedList warning */}
      {friends.length > 0 && (
        <FlatList
          data={friends}
          keyExtractor={(f) => String(f.id)}
          renderItem={renderFriend}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  actionBtnText: { color: colors.bg, fontWeight: '700', fontSize: 13 },
  notifBtn: { marginLeft: 'auto', position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: colors.accent2, borderRadius: 8, minWidth: 16, alignItems: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  section: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  requestRow: { backgroundColor: colors.card, borderRadius: radius.sm, marginBottom: spacing.xs, paddingHorizontal: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card },
  rowInfo: { flex: 1 },
  displayName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  username: { color: colors.muted, fontSize: 12 },
  reqBtns: { flexDirection: 'row', gap: spacing.xs },
  acceptBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f87171', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.muted, textAlign: 'center' },
});
