// constants/animations.ts — Ateş karakter animasyon sabitleri
import type { AtesState } from '../types';

export interface AnimationConfig {
  name: string;
  loop: boolean;
  duration: number; // ms
}

export const ATES_ANIMATIONS: Record<AtesState, AnimationConfig> = {
  idle: { name: 'idle_bounce', loop: true, duration: 2000 },
  talking: { name: 'talk_mouth', loop: true, duration: 500 },
  waiting: { name: 'tail_bite', loop: true, duration: 3000 },
  correct: { name: 'backflip_confetti', loop: false, duration: 2500 },
  wrong: { name: 'fall_down', loop: false, duration: 2000 },
  explaining: { name: 'slow_gesture', loop: true, duration: 4000 },
  celebrating: { name: 'dance_happy', loop: true, duration: 3000 },
  loading: { name: 'spin', loop: true, duration: 1000 },
};

/**
 * Ateş 3D model bilgisi.
 * Geometrik placeholder Three.js ile SceneManager içinde oluşturulur.
 * Gerçek .glb model hazır olduğunda buradan yüklenecek.
 */
export const ATES_MODEL = {
  // Gerçek model dosyası hazır olduğunda:
  // source: require('../assets/models/ates_fox.glb'),
  source: 'ates_fox.glb',
  scale: [0.3, 0.3, 0.3] as [number, number, number],
  defaultPosition: [0, 0, -1] as [number, number, number],
};

export const CONFETTI_COLORS = ['#FF6B35', '#FFD700', '#FF4081', '#00E676', '#448AFF'];

/** Three.js nesne renk haritası */
export const OBJECT_COLORS: Record<string, number> = {
  apple: 0xe53935,
  star: 0xffd700,
  block: 0x2196f3,
  plus: 0x4caf50,
  plate: 0xeeeeee,
  pizza: 0xffb74d,
  square: 0x9c27b0,
};
