// src/components/ScoreBlock.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';

interface Props {
  imdb?: number | null;
  rt?: number | null;
  size?: 'sm' | 'md';
}

function scoreColor(score: number): string {
  if (score >= 75) return '#4ade80';
  if (score >= 50) return '#facc15';
  return '#f87171';
}

export default function ScoreBlock({ imdb, rt, size = 'md' }: Props) {
  const isSmall = size === 'sm';

  return (
    <View style={styles.row}>
      {imdb != null && imdb > 0 ? (
        <View style={[styles.chip, { borderColor: scoreColor(imdb * 10) }]}>
          <Text style={[styles.label, isSmall && styles.labelSm]}>IMDb</Text>
          <Text style={[styles.score, { color: scoreColor(imdb * 10) }, isSmall && styles.scoreSm]}>
            {imdb.toFixed(1)}
          </Text>
        </View>
      ) : null}
      {rt != null && rt > 0 ? (
        <View style={[styles.chip, { borderColor: scoreColor(rt) }]}>
          <Text style={[styles.label, isSmall && styles.labelSm]}>RT</Text>
          <Text style={[styles.score, { color: scoreColor(rt) }, isSmall && styles.scoreSm]}>
            {rt}%
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  label: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  labelSm: { fontSize: 8 },
  score: { fontSize: 12, fontWeight: '700' },
  scoreSm: { fontSize: 10 },
});
