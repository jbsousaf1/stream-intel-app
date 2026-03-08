// src/components/PlatformBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

interface Props {
  platform: string;
  small?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  netflix: '#E50914',
  'disney+': '#113CCF',
  'hbo max': '#6D2CC4',
  max: '#6D2CC4',
  'apple tv+': '#1c1c1e',
  'amazon prime video': '#00A8E1',
  prime: '#00A8E1',
  hulu: '#1CE783',
  peacock: '#F2A900',
  'paramount+': '#0064FF',
};

function platformColor(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return colors.surface;
}

function platformAbbr(name: string): string {
  const map: Record<string, string> = {
    netflix: 'NF',
    'disney+': 'D+',
    'amazon prime video': 'PV',
    prime: 'PV',
    'apple tv+': 'TV+',
    'hbo max': 'MAX',
    max: 'MAX',
    hulu: 'HULU',
    peacock: 'PCK',
    'paramount+': 'P+',
  };
  const lc = name.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (lc.includes(k)) return v;
  }
  return name.slice(0, 3).toUpperCase();
}

export default function PlatformBadge({ platform, small }: Props) {
  const bg = platformColor(platform);
  const abbr = platformAbbr(platform);

  return (
    <View style={[styles.badge, small && styles.small, { backgroundColor: bg }]}>
      <Text style={[styles.text, small && styles.textSmall]}>{abbr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  text: { color: '#fff', fontWeight: '700', fontSize: 11 },
  textSmall: { fontSize: 9 },
});
