// app/(child)/modules.tsx — Tüm modüller grid ekranı
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useProgress } from '../../hooks/useProgress';
import { ModuleCard } from '../../components/ui/ModuleCard';
import { StarBadge } from '../../components/ui/StarBadge';
import { getModulesForGrade } from '../../constants/lessons';
import type { LessonModule, Progress } from '../../types';
import { useTranslation } from 'react-i18next';

export default function ModulesScreen() {
  const router = useRouter();
  const activeChild = useAuthStore((s) => s.activeChild);
  const { loadProgress } = useProgress();
  const [progress, setProgress] = useState<Progress[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    loadProgress().then(setProgress);
  }, [loadProgress]);

  if (!activeChild) return null;

  const modules = getModulesForGrade(activeChild.grade);

  const getModuleProgress = (moduleId: string) =>
    progress.find((p) => p.moduleId === moduleId);

  const handleModulePress = (module: LessonModule) => {
    router.push(`/(child)/lesson/${module.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeChild.grade}. {t('parent.gradeLessons')}</Text>
        <StarBadge count={activeChild.totalStars} />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {modules.map((module) => {
          const prog = getModuleProgress(module.id);
          return (
            <ModuleCard
              key={module.id}
              module={module}
              currentStars={activeChild.totalStars}
              completed={prog?.completed ?? false}
              bestScore={prog?.bestScore ?? 0}
              onPress={handleModulePress}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
