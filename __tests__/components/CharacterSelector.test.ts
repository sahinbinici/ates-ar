// __tests__/components/CharacterSelector.test.ts — CharacterSelector render testi
import { CHARACTERS } from '../../constants/characters';

// Mock React Native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}));

describe('CharacterSelector data', () => {
  it('tüm karakterler için emoji mapping mevcut olmalı', () => {
    const ANIMAL_EMOJI: Record<string, string> = {
      fox: '🦊', rabbit: '🐰', owl: '🦉', dolphin: '🐬', lion: '🦁',
    };
    for (const ch of CHARACTERS) {
      expect(ANIMAL_EMOJI[ch.animal]).toBeDefined();
    }
  });

  it('her karakterin unique id değeri olmalı', () => {
    const ids = CHARACTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('her karakterin renk kodu olmalı', () => {
    for (const ch of CHARACTERS) {
      expect(ch.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('premium karakterlerin starsRequired > 0 olmalı', () => {
    const premiums = CHARACTERS.filter((c) => c.isPremium);
    for (const ch of premiums) {
      expect(ch.starsRequired).toBeGreaterThan(0);
    }
  });

  it('en az 2 ücretsiz karakter olmalı', () => {
    const free = CHARACTERS.filter((c) => !c.isPremium && c.starsRequired === 0);
    expect(free.length).toBeGreaterThanOrEqual(2);
  });
});
