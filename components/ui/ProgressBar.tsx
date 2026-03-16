// components/ui/ProgressBar.tsx — İlerleme çubuğu
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  current: number;
  total: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ current, total, label, color = '#FF6B35' }: Props) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.text}>
        {current}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  track: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  text: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});
