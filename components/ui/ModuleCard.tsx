// components/ui/ModuleCard.tsx — Modül kart bileşeni
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { LessonModule } from '../../types';
import { SUBJECT_EMOJIS } from '../../constants/subjects';
import { StarBadge } from './StarBadge';

interface Props {
  module: LessonModule;
  currentStars: number;
  completed: boolean;
  bestScore: number;
  onPress: (module: LessonModule) => void;
}

export function ModuleCard({ module, currentStars, completed, bestScore, onPress }: Props) {
  const isLocked = currentStars < module.starsRequired;

  const subjectEmoji = SUBJECT_EMOJIS[module.subject];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        completed && styles.cardCompleted,
        isLocked && styles.cardLocked,
      ]}
      onPress={() => onPress(module)}
      disabled={isLocked}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.subjectEmoji}>{subjectEmoji}</Text>
        {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
        {completed && <Text style={styles.checkIcon}>✅</Text>}
      </View>

      <Text style={[styles.title, isLocked && styles.titleLocked]}>
        {module.title}
      </Text>

      <Text style={styles.grade}>{module.grade}. Sınıf</Text>

      {isLocked ? (
        <View style={styles.lockInfo}>
          <StarBadge count={module.starsRequired} size="small" />
          <Text style={styles.lockText}>gerekli</Text>
        </View>
      ) : completed ? (
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreText}>En iyi: {bestScore} ⭐</Text>
        </View>
      ) : (
        <Text style={styles.playText}>Oynamaya Başla →</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  cardLocked: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectEmoji: {
    fontSize: 28,
  },
  lockIcon: {
    fontSize: 20,
  },
  checkIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  titleLocked: {
    color: '#999',
  },
  grade: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  lockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockText: {
    fontSize: 13,
    color: '#999',
  },
  scoreInfo: {
    marginTop: 4,
  },
  scoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  playText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
