// src/screens/SearchUsersScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useFriends } from '../hooks/useFriends';
import { colors, spacing, radius } from '../constants/theme';
import type { UserSearchResult } from '../services/friendsService';

export default function SearchUsersScreen() {
  const { searchResults, search, sendRequest, cancel, isLoading } = useFriends();
  const [query, setQuery] = useState('');
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback(
    (text: string) => {
      setQuery(text);
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => search(text), 350);
    },
    [search],
  );

  const renderItem = ({ item }: { item: UserSearchResult }) => {
    const { friendship_status } = item;
    return (
      <View style={styles.row}>
        <FastImage
          style={styles.avatar}
          source={item.profile_pic ? { uri: item.profile_pic } : require('../assets/placeholder_avatar.png')}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.info}>
          <Text style={styles.displayName}>{item.display_name || item.username}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        {friendship_status === 'friends' ? (
          <Text style={styles.friendLabel}>Friends</Text>
        ) : friendship_status === 'request_sent' ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => cancel(item.id)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        ) : friendship_status === 'request_received' ? (
          <Text style={styles.pendingLabel}>Pending</Text>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => sendRequest(item.id)}>
            <MaterialIcons name="person-add" size={16} color={colors.bg} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder="Search by username…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={handleChange}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        {query ? (
          <TouchableOpacity onPress={() => { setQuery(''); search(''); }}>
            <MaterialIcons name="close" size={16} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.accent} />
      ) : searchResults.length === 0 && query.length >= 2 ? (
        <Text style={styles.empty}>No users found for "{query}".</Text>
      ) : query.length < 2 ? (
        <Text style={styles.hint}>Type at least 2 characters to search.</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(u) => String(u.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, margin: spacing.md, borderRadius: 20, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 1, gap: spacing.xs },
  input: { flex: 1, color: colors.text, fontSize: 14, padding: 0 },
  list: { paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card },
  info: { flex: 1 },
  displayName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  username: { color: colors.muted, fontSize: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: 3 },
  addBtnText: { color: colors.bg, fontWeight: '700', fontSize: 12 },
  cancelBtn: { borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  cancelBtnText: { color: colors.muted, fontSize: 12 },
  friendLabel: { color: colors.accent, fontSize: 12 },
  pendingLabel: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  hint: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl, fontSize: 13 },
});
