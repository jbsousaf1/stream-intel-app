// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuthStore } from '../store/authStore';
import { colors, spacing, radius, typography } from '../constants/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    setLocalError(null);
    clearError();
    if (!username.trim() || !password) { setLocalError('Username and password are required.'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setLocalError('Passwords do not match.'); return; }
    try {
      await register(username.trim(), password, displayName.trim() || undefined);
    } catch {
      // error shown from store
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>StreamIntel</Text>
        <Text style={styles.subtitle}>Create an account</Text>

        {displayError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Username *</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={(t) => { setLocalError(null); clearError(); setUsername(t); }}
          returnKeyType="next"
        />

        <Text style={styles.label}>Display Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor={colors.muted}
          value={displayName}
          onChangeText={setDisplayName}
          returnKeyType="next"
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={(t) => { setLocalError(null); clearError(); setPassword(t); }}
          returnKeyType="next"
        />

        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={confirm}
          onChangeText={(t) => { setLocalError(null); setConfirm(t); }}
          returnKeyType="done"
          onSubmitEditing={handleRegister}
        />

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl * 2 },
  logo: { fontSize: 34, fontWeight: '700', color: colors.accent, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.muted, textAlign: 'center', marginBottom: spacing.xl },
  errorBox: { backgroundColor: '#3b1010', borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { color: '#f87171', fontSize: 13 },
  label: { color: colors.muted, fontSize: 12, marginBottom: 4, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  btn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.bg, fontWeight: '700', fontSize: 15 },
  linkRow: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.muted, fontSize: 13 },
  link: { color: colors.accent },
});
