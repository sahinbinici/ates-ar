// app/(child)/home.tsx — Çocuğun ana ekranı
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { StarBadge } from '../../components/ui/StarBadge';
import { AtesCharacter } from '../../components/ar/AtesCharacter';
import { LESSON_MODULES } from '../../constants/lessons';
import { getCharacterById, DEFAULT_CHARACTER_ID } from '../../constants/characters';
import { useTranslation } from 'react-i18next';

const ANIMAL_EMOJI: Record<string, string> = {
  fox: '🦊', rabbit: '🐰', owl: '🦉', dolphin: '🐬', lion: '🦁',
};

export default function ChildHomeScreen() {
  const router = useRouter();
  const activeChild = useAuthStore((s) => s.activeChild);
  const { t } = useTranslation();

  if (!activeChild) return null;

  const character = getCharacterById(activeChild.selectedCharacterId ?? DEFAULT_CHARACTER_ID)!;
  const emoji = ANIMAL_EMOJI[character.animal] ?? '🐾';

  // Günün önerilen modülü: ilk açılmamış modül
  const recommendedModule = LESSON_MODULES.find(
    (m) => m.grade === activeChild.grade && m.starsRequired <= activeChild.totalStars,
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst bilgi */}
      <View style={styles.topBar}>
        <Text style={styles.greeting}>{t('child.greeting')}, {activeChild.name}! {emoji}</Text>
        <StarBadge count={activeChild.totalStars} />
      </View>

      {/* Karakter */}
      <View style={styles.characterContainer}>
        <AtesCharacter state="idle" />
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            {character.name}: {t('child.readyToLearn')}
          </Text>
        </View>
      </View>

      {/* Önerilen modül */}
      {recommendedModule && (
        <TouchableOpacity
          style={styles.recommendedCard}
          onPress={() => router.push(`/(child)/lesson/${recommendedModule.id}`)}
        >
          <Text style={styles.recommendedLabel}>📚 {t('child.todayLesson')}</Text>
          <Text style={styles.recommendedTitle}>{recommendedModule.title}</Text>
          <Text style={styles.recommendedAction}>{t('child.start')} →</Text>
        </TouchableOpacity>
      )}

      {/* Modüller butonu */}
      <TouchableOpacity
        style={styles.modulesButton}
        onPress={() => router.push('/(child)/modules')}
      >
        <Text style={styles.modulesButtonText}>🗂️ {t('child.allLessons')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  characterContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  speechText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  recommendedCard: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  recommendedLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  recommendedTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendedAction: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modulesButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  modulesButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
