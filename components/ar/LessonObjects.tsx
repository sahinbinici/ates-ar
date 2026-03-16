// components/ar/LessonObjects.tsx — Sahne objeleri 2D fallback / debug görünümü
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ARObject } from '../../types';

interface Props {
  objects: ARObject[];
  onObjectTouched?: (objectId: string) => void;
}

/**
 * AR sahnedeki nesnelerin 2D fallback gösterimi.
 * Asıl 3D render, SceneManager (Three.js) içinde yapılır.
 * Bu bileşen, AR olmayan ekranlar veya debug modu için kullanılabilir.
 */
export function LessonObjects({ objects, onObjectTouched }: Props) {
  const modelToEmoji: Record<string, string> = {
    apple: '🍎',
    star: '⭐',
    block: '🟦',
    plus: '➕',
    plate: '🍽️',
    pizza: '🍕',
    square: '⬜',
  };

  const getObjectEmoji = (model: string): string => {
    for (const [key, emoji] of Object.entries(modelToEmoji)) {
      if (model.includes(key)) return emoji;
    }
    return '📦';
  };

  return (
    <View style={styles.container}>
      {objects.map((obj) => {
        const emoji = getObjectEmoji(obj.model);
        const left = (obj.position[0] + 0.5) * 200;
        const top = (0.5 - obj.position[1]) * 200;

        return (
          <TouchableOpacity
            key={obj.id}
            style={[styles.object, { left, top }]}
            disabled={!obj.interactive}
            onPress={() => onObjectTouched?.(obj.id)}
            activeOpacity={obj.interactive ? 0.6 : 1}
          >
            <Text style={[styles.emoji, { fontSize: obj.scale[0] * 300 }]}>
              {emoji}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginVertical: 20,
  },
  object: {
    position: 'absolute',
  },
  emoji: {
    fontSize: 30,
  },
});
