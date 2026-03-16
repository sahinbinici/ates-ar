// components/ar/AtesCharacter.tsx — Ateş bileşeni: GLB model veya emoji fallback
import React from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import type { AtesState } from '../../types';
import { ATES_ANIMATIONS } from '../../constants/animations';
import { SceneManager } from '../../lib/ar/SceneManager';

interface Props {
  state: AtesState;
  size?: number;
}

/**
 * Ateş karakteri bileşeni.
 * GLB model yüklenene kadar spinner gösterir.
 * Model yüklenemezse emoji fallback'e döner.
 */
export function AtesCharacter({ state, size = 120 }: Props) {
  const [modelReady, setModelReady] = React.useState(false);
  const [modelFailed, setModelFailed] = React.useState(false);
  const sceneRef = React.useRef<SceneManager | null>(null);

  const animation = ATES_ANIMATIONS[state];
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Ateş durumu değiştiğinde 3D sahneyi güncelle
  React.useEffect(() => {
    sceneRef.current?.setAtesState(state);
  }, [state]);

  React.useEffect(() => {
    // Zıplama animasyonu (emoji fallback için)
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

  const handleContextCreate = React.useCallback(
    async (gl: WebGLRenderingContext) => {
      try {
        const manager = new SceneManager();
        manager.onModelLoaded = () => setModelReady(true);
        manager.onModelError = () => setModelFailed(true);
        sceneRef.current = manager;
        await manager.init(
          gl as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          gl.drawingBufferWidth,
          gl.drawingBufferHeight,
        );
        manager.setAtesState(state);
      } catch (err) {
        console.warn('[AtesCharacter] GL init hatası:', err);
        setModelFailed(true);
      }
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Temizlik
  React.useEffect(() => {
    return () => {
      sceneRef.current?.dispose();
    };
  }, []);

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

  // Model başarısız → emoji fallback
  if (modelFailed) {
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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <GLView
        style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}
        onContextCreate={handleContextCreate}
      />
      {!modelReady && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size="small" color="#FF6B35" />
        </View>
      )}
    </View>
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
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 999,
  },
});
