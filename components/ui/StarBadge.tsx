// components/ui/StarBadge.tsx — Yıldız rozeti göstergesi
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

export function StarBadge({ count, size = 'medium' }: Props) {
  const fontSize = size === 'small' ? 14 : size === 'large' ? 28 : 20;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 32 : 22;

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { fontSize: iconSize }]}>⭐</Text>
      <Text style={[styles.count, { fontSize }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  icon: {
    fontSize: 22,
  },
  count: {
    fontWeight: 'bold',
    color: '#FFB300',
    fontSize: 20,
  },
});
