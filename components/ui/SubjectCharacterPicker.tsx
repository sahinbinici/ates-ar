// components/ui/SubjectCharacterPicker.tsx — Ders + karakter iki adımlı seçici
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CHARACTERS, getExpertsForSubject } from '../../constants/characters';
import { SUBJECT_NAMES, SUBJECT_EMOJIS } from '../../constants/subjects';
import type { SubjectId, Character } from '../../types';

const ALL_SUBJECTS: SubjectId[] = ['math', 'turkish', 'science', 'social'];

const ANIMAL_EMOJI: Record<string, string> = {
  fox: '🦊',
  rabbit: '🐰',
  owl: '🦉',
  dolphin: '🐬',
  lion: '🦁',
};

interface Props {
  totalStars: number;
  isPremiumUser: boolean;
  onConfirm: (subject: SubjectId, character: Character) => void;
}

function isCharacterUnlocked(
  character: Character,
  totalStars: number,
  isPremiumUser: boolean,
): boolean {
  if (character.isPremium && !isPremiumUser) return false;
  return totalStars >= character.starsRequired;
}

export function SubjectCharacterPicker({ totalStars, isPremiumUser, onConfirm }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  const handleSubjectSelect = (subject: SubjectId) => {
    setSelectedSubject(subject);
    // Otomatik olarak o dersin uzmanını seç
    const experts = getExpertsForSubject(subject);
    const firstUnlocked = experts.find((c) => isCharacterUnlocked(c, totalStars, isPremiumUser));
    setSelectedChar(firstUnlocked ?? null);
    setStep(2);
  };

  const handleCharacterSelect = (character: Character) => {
    if (isCharacterUnlocked(character, totalStars, isPremiumUser)) {
      setSelectedChar(character);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedSubject(null);
    setSelectedChar(null);
  };

  const handleConfirm = () => {
    if (selectedSubject && selectedChar) {
      onConfirm(selectedSubject, selectedChar);
    }
  };

  // Adım 1: Ders seçimi
  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ders Seç 📚</Text>
        <View style={styles.subjectGrid}>
          {ALL_SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={styles.subjectCard}
              onPress={() => handleSubjectSelect(subject)}
            >
              <Text style={styles.subjectEmoji}>{SUBJECT_EMOJIS[subject]}</Text>
              <Text style={styles.subjectName}>{SUBJECT_NAMES[subject]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Adım 2: Karakter seçimi (uzman vurgulanır)
  const experts = selectedSubject ? getExpertsForSubject(selectedSubject) : [];
  const expertIds = new Set(experts.map((c) => c.id));

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backText}>← Ders Seç</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {SUBJECT_EMOJIS[selectedSubject!]} {SUBJECT_NAMES[selectedSubject!]} — Öğretmen Seç
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.charScroll}
      >
        {CHARACTERS.map((character) => {
          const unlocked = isCharacterUnlocked(character, totalStars, isPremiumUser);
          const isExpert = expertIds.has(character.id);
          const isSelected = selectedChar?.id === character.id;

          return (
            <TouchableOpacity
              key={character.id}
              style={[
                styles.charCard,
                { borderColor: character.color },
                isSelected && styles.charCardSelected,
                !unlocked && styles.charCardLocked,
              ]}
              onPress={() => handleCharacterSelect(character)}
              activeOpacity={unlocked ? 0.7 : 1}
            >
              {/* Uzman rozeti */}
              {isExpert && unlocked && (
                <View style={styles.expertTag}>
                  <Text style={styles.expertTagText}>⭐ Uzman</Text>
                </View>
              )}

              {character.isPremium && (
                <Text style={styles.crown}>👑</Text>
              )}

              <Text style={[styles.charEmoji, !unlocked && styles.emojiLocked]}>
                {ANIMAL_EMOJI[character.animal] ?? '🐾'}
              </Text>
              <Text style={[styles.charName, !unlocked && styles.nameLocked]}>
                {character.name}
              </Text>

              {!unlocked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.lockText}>⭐ {character.starsRequired}</Text>
                </View>
              )}

              {isSelected && unlocked && (
                <View style={[styles.selectedBadge, { backgroundColor: character.color }]}>
                  <Text style={styles.selectedCheck}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedChar && (
        <View style={styles.confirmSection}>
          <Text style={styles.selectedInfo}>
            {selectedChar.name} — {selectedChar.personality}
          </Text>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: selectedChar.color }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Derse Başla →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Ders kartları
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  subjectCard: {
    width: 140,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  // Geri butonu
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  // Karakter kartları
  charScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  charCard: {
    width: 100,
    height: 150,
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
  charCardSelected: {
    borderWidth: 4,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  charCardLocked: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  expertTag: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFB300',
  },
  expertTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF8F00',
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 18,
  },
  charEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  emojiLocked: {
    opacity: 0.4,
  },
  charName: {
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
  // Onay bölümü
  confirmSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  selectedInfo: {
    fontSize: 15,
    color: '#555',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
