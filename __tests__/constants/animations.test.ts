// __tests__/constants/animations.test.ts — Animasyon sabitleri testleri
import { ATES_ANIMATIONS, ATES_MODEL, CONFETTI_COLORS, OBJECT_COLORS } from '../../constants/animations';
import type { AtesState } from '../../types';

const ALL_STATES: AtesState[] = [
  'idle', 'talking', 'waiting', 'correct', 'wrong', 'explaining', 'celebrating', 'loading',
];

describe('ATES_ANIMATIONS', () => {
  it('tüm durumlar için animasyon tanımlı olmalı', () => {
    for (const state of ALL_STATES) {
      expect(ATES_ANIMATIONS[state]).toBeDefined();
      expect(ATES_ANIMATIONS[state].name).toBeTruthy();
      expect(ATES_ANIMATIONS[state].duration).toBeGreaterThan(0);
      expect(typeof ATES_ANIMATIONS[state].loop).toBe('boolean');
    }
  });

  it('correct animasyonu loop olmamalı', () => {
    expect(ATES_ANIMATIONS.correct.loop).toBe(false);
  });

  it('idle animasyonu loop olmalı', () => {
    expect(ATES_ANIMATIONS.idle.loop).toBe(true);
  });
});

describe('ATES_MODEL', () => {
  it('model bilgisi tanımlı olmalı', () => {
    expect(ATES_MODEL.source).toBeTruthy();
    expect(ATES_MODEL.scale).toHaveLength(3);
    expect(ATES_MODEL.defaultPosition).toHaveLength(3);
  });
});

describe('CONFETTI_COLORS', () => {
  it('en az 3 renk tanımlı olmalı', () => {
    expect(CONFETTI_COLORS.length).toBeGreaterThanOrEqual(3);
  });

  it('tüm renkler geçerli hex formatında olmalı', () => {
    for (const color of CONFETTI_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('OBJECT_COLORS', () => {
  it('temel nesneler için renk tanımlı olmalı', () => {
    expect(OBJECT_COLORS.apple).toBeDefined();
    expect(OBJECT_COLORS.star).toBeDefined();
    expect(OBJECT_COLORS.block).toBeDefined();
  });

  it('tüm renkler sayı olmalı', () => {
    for (const color of Object.values(OBJECT_COLORS)) {
      expect(typeof color).toBe('number');
    }
  });
});
