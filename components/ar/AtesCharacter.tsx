// components/ar/AtesCharacter.tsx — 2D animasyonlu Ateş bileşeni (non-AR ekranlar için)
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import type { AtesState } from '../../types';
import { ATES_ANIMATIONS } from '../../constants/animations';

interface Props {
  state: AtesState;
  size?: number;
}

/**
 * Ateş karakteri 2D animasyonlu görünüm.
 * Ana ekran, modül listesi gibi non-AR ekranlar için kullanılır.
 * AR sahnedeki 3D Ateş, SceneManager tarafından Three.js ile render edilir.
 */
export function AtesCharacter({ state, size = 120 }: Props) {
  const animation = ATES_ANIMATIONS[state];
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Zıplama animasyonu
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: animation.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: animation.duration / 2,
          useNativeDriver: true,
        }),
      ]),
    );
    bounce.start();

    // Durum değişiminde ölçek efekti
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    return () => bounce.stop();
  }, [state, animation, bounceAnim, scaleAnim]);

  const stateEmoji: Record<AtesState, string> = {
    idle: '🦊',
    talking: '🦊💬',
    waiting: '🦊❓',
    correct: '🦊⭐',
    wrong: '🦊💪',
    explaining: '🦊📖',
    celebrating: '🦊🎉',
    loading: '🦊⏳',
  };

  const stateColor: Record<AtesState, string> = {
    idle: 'rgba(255, 107, 53, 0.2)',
    talking: 'rgba(255, 107, 53, 0.3)',
    waiting: 'rgba(255, 193, 7, 0.2)',
    correct: 'rgba(76, 175, 80, 0.3)',
    wrong: 'rgba(255, 152, 0, 0.3)',
    explaining: 'rgba(33, 150, 243, 0.2)',
    celebrating: 'rgba(255, 215, 0, 0.4)',
    loading: 'rgba(158, 158, 158, 0.2)',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: bounceAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.character,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: stateColor[state],
          },
        ]}
      >
        <Animated.Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
          {stateEmoji[state]}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 60,
  },
});
