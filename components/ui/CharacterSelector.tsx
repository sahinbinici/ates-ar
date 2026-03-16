// components/ui/CharacterSelector.tsx — Yatay scroll'lu karakter seçim bileşeni
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CHARACTERS } from '../../constants/characters';
import { SUBJECT_NAMES, SUBJECT_EMOJIS } from '../../constants/subjects';
import type { Character } from '../../types';

const ANIMAL_EMOJI: Record<string, string> = {
  fox: '🦊',
  rabbit: '🐰',
  owl: '🦉',
  dolphin: '🐬',
  lion: '🦁',
};

interface Props {
  selectedId: string;
  totalStars: number;
  isPremiumUser: boolean;
  onSelect: (character: Character) => void;
}

function isCharacterUnlocked(
  character: Character,
  totalStars: number,
  isPremiumUser: boolean,
): boolean {
  if (character.isPremium && !isPremiumUser) return false;
  return totalStars >= character.starsRequired;
}

export function CharacterSelector({ selectedId, totalStars, isPremiumUser, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {CHARACTERS.map((character) => {
        const unlocked = isCharacterUnlocked(character, totalStars, isPremiumUser);
        const isSelected = character.id === selectedId;

        return (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.card,
              { borderColor: character.color },
              isSelected && styles.cardSelected,
              !unlocked && styles.cardLocked,
            ]}
            onPress={() => unlocked && onSelect(character)}
            activeOpacity={unlocked ? 0.7 : 1}
          >
            {/* Premium taç */}
            {character.isPremium && (
              <Text style={styles.crown}>👑</Text>
            )}

            {/* Karakter emoji */}
            <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>
              {ANIMAL_EMOJI[character.animal] ?? '🐾'}
            </Text>

            {/* İsim */}
            <Text style={[styles.name, !unlocked && styles.nameLocked]}>
              {character.name}
            </Text>

            {/* Uzmanlık rozeti */}
            {unlocked && (
              <Text style={styles.expertBadge}>
                ⭐ {SUBJECT_NAMES[character.defaultSubject]}
              </Text>
            )}

            {/* Ders ikonları */}
            {unlocked && (
              <View style={styles.subjectIcons}>
                {character.subjectExpertise.map((s) => (
                  <Text key={s} style={styles.subjectIcon}>{SUBJECT_EMOJIS[s]}</Text>
                ))}
              </View>
            )}

            {/* Kilitli overlay */}
            {!unlocked && (
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.lockText}>⭐ {character.starsRequired}</Text>
              </View>
            )}

            {/* Seçili gösterge */}
            {isSelected && unlocked && (
              <View style={[styles.selectedBadge, { backgroundColor: character.color }]}>
                <Text style={styles.selectedCheck}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  card: {
    width: 100,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 4,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardLocked: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 18,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  emojiLocked: {
    opacity: 0.4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  nameLocked: {
    color: '#999',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 16,
  },
  lockText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expertBadge: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FF8F00',
    marginTop: 2,
  },
  subjectIcons: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  subjectIcon: {
    fontSize: 12,
  },
});
