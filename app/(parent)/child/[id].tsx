// app/(parent)/child/[id].tsx — Çocuk detay ekranı
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { useProgress } from '../../../hooks/useProgress';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StarBadge } from '../../../components/ui/StarBadge';
import type { Child, Progress, WeeklySummary } from '../../../types';
import { LESSON_MODULES } from '../../../constants/lessons';
import { useTranslation } from 'react-i18next';

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const children = useAuthStore((s) => s.children);
  const setActiveChild = useAuthStore((s) => s.setActiveChild);
  const { loadProgress, getWeeklySummary } = useProgress();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const { t } = useTranslation();

  const child = children.find((c) => c.id === id);

  useEffect(() => {
    if (child) {
      setActiveChild(child);
      loadProgress().then(setProgress);
      getWeeklySummary().then(setSummary);
    }
  }, [child, setActiveChild, loadProgress, getWeeklySummary]);

  if (!child) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('parent.profileNotFound')}</Text>
      </View>
    );
  }

  const gradeModules = LESSON_MODULES.filter((m) => m.grade === child.grade);
  const completedModules = progress.filter((p) => p.completed).length;
  const totalModules = gradeModules.length;

  return (
    <ScrollView style={styles.container}>
      {/* Profil Kartı */}
      <View style={styles.profileCard}>
        <Text style={styles.avatar}>🧒</Text>
        <Text style={styles.name}>{child.name}</Text>
        <Text style={styles.grade}>{child.grade}. {t('parent.gradeClass')} • {child.age} {t('parent.age')}</Text>
        <StarBadge count={child.totalStars} size="large" />
      </View>

      {/* Haftalık Özet */}
      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>{t('parent.weeklyReport')}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.total_sessions}</Text>
              <Text style={styles.summaryLabel}>{t('parent.sessions')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.total_time_min} {t('settings.min')}</Text>
              <Text style={styles.summaryLabel}>{t('parent.duration')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.stars_earned} ⭐</Text>
              <Text style={styles.summaryLabel}>{t('parent.stars')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Derse Başla */}
      <TouchableOpacity
        style={styles.startLessonButton}
        onPress={() => router.push('/(child)/home')}
      >
        <Text style={styles.startLessonText}>🦊 {t('child.start')}</Text>
      </TouchableOpacity>

      {/* Modül İlerleme */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parent.moduleProgress')}</Text>
        <ProgressBar
          current={completedModules}
          total={totalModules}
          label={t('parent.completedModules')}
          color="#4CAF50"
        />

        {gradeModules.map((module) => {
          const p = progress.find((pr) => pr.moduleId === module.id);
          return (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleRow}
              onPress={() => router.push(`/(child)/lesson/${module.id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.moduleName}>{module.title}</Text>
              <View style={styles.moduleStats}>
                {p ? (
                  <>
                    <Text style={styles.moduleScore}>⭐ {p.bestScore}</Text>
                    {p.completed && <Text style={styles.moduleComplete}>✅</Text>}
                  </>
                ) : (
                  <Text style={styles.moduleNotStarted}>Oyna →</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  profileCard: {
    backgroundColor: '#1a1a2e',
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    fontSize: 56,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  grade: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  moduleRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleScore: {
    fontSize: 14,
    color: '#FFB300',
  },
  moduleComplete: {
    fontSize: 16,
  },
  moduleNotStarted: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  startLessonButton: {
    backgroundColor: '#FF6B35',
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  startLessonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
