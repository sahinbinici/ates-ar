// app/(child)/lesson/[moduleId].tsx — AR ders ekranı (tam ekran)
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, BackHandler, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ARScene } from '../../../components/ar/ARScene';
import { QuestionOverlay } from '../../../components/lesson/QuestionOverlay';
import { RewardScreen } from '../../../components/lesson/RewardScreen';
import { SubjectCharacterPicker } from '../../../components/ui/SubjectCharacterPicker';
import { useLesson } from '../../../hooks/useLesson';
import { useCharacter } from '../../../hooks/useCharacter';
import { useLessonStore } from '../../../stores/lessonStore';
import { useAuthStore } from '../../../stores/authStore';
import { getModuleById } from '../../../constants/lessons';
import type { Character, SubjectId } from '../../../types';

export default function LessonScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const router = useRouter();
  const activeChild = useAuthStore((s) => s.activeChild);
  const { beginLesson, handleVoiceAnswer, stopVoiceAnswer, endLesson } = useLesson();
  const { selectCharacter } = useCharacter();
  const currentModule = useLessonStore((s) => s.currentModule);
  const score = useLessonStore((s) => s.score);
  const atesState = useLessonStore((s) => s.atesState);
  const [showReward, setShowReward] = useState(false);
  const [pickingCharacter, setPickingCharacter] = useState(true);

  const handlePickerConfirm = useCallback((subject: SubjectId, character: Character) => {
    selectCharacter(character.id);
    const module = getModuleById(moduleId);
    if (module) {
      setPickingCharacter(false);
      beginLesson(module, character, subject);
    }
  }, [moduleId, beginLesson, selectCharacter]);

  // Geri tuşu ile dersi bitir
  useEffect(() => {
    const backAction = () => {
      endLesson();
      return false;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, [endLesson]);

  // Kutlama durumunda ödül ekranı göster
  useEffect(() => {
    if (atesState === 'celebrating') {
      const timer = setTimeout(() => setShowReward(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [atesState]);

  const handleContinue = useCallback(() => {
    endLesson();
    router.back();
  }, [endLesson, router]);

  if (showReward && currentModule) {
    return (
      <RewardScreen
        moduleName={currentModule.title}
        score={score}
        totalQuestions={currentModule.questions.length}
        onContinue={handleContinue}
      />
    );
  }

  if (pickingCharacter) {
    return (
      <SafeAreaView style={styles.pickerContainer}>
        <SubjectCharacterPicker
          totalStars={activeChild?.totalStars ?? 0}
          isPremiumUser={false}
          onConfirm={handlePickerConfirm}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* AR Sahne */}
      <ARScene />

      {/* Soru overlay */}
      <QuestionOverlay onMicPress={handleVoiceAnswer} onStopPress={stopVoiceAnswer} />

      {/* Çıkış butonu */}
      <TouchableOpacity style={styles.exitButton} onPress={handleContinue}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  exitText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
});
