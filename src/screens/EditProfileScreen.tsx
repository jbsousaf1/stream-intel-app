// src/screens/EditProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useProfile } from '../hooks/useProfile';
import { colors, spacing, radius } from '../constants/theme';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { profile, isLoading, isSaving, load, save } = useProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [libraryPublic, setLibraryPublic] = useState(true);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setBio(profile.bio ?? '');
      setLibraryPublic(profile.library_public ?? true);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await save({ display_name: displayName.trim() || undefined, bio: bio.trim() || undefined, library_public: libraryPublic });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  if (isLoading && !profile) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your display name"
        placeholderTextColor={colors.muted}
        maxLength={50}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={bio}
        onChangeText={setBio}
        placeholder="Write a short bio…"
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={4}
        maxLength={200}
      />

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Public Library</Text>
          <Text style={styles.switchHint}>Allow friends to see your library</Text>
        </View>
        <Switch
          value={libraryPublic}
          onValueChange={setLibraryPublic}
          trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor="#fff"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.muted, fontSize: 12, marginBottom: 4, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 15 },
  textarea: { height: 90, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, paddingVertical: spacing.sm },
  switchLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  switchHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.bg, fontWeight: '700', fontSize: 15 },
});
