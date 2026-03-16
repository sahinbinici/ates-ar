// components/lesson/QuestionOverlay.tsx — Soru arayüzü katmanı
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLessonStore } from '../../stores/lessonStore';

interface Props {
  onMicPress: () => void;
  onStopPress: () => void;
}

export function QuestionOverlay({ onMicPress, onStopPress }: Props) {
  const { t } = useTranslation();
  const currentQuestion = useLessonStore((s) => s.currentQuestion);
  const currentQuestionIndex = useLessonStore((s) => s.currentQuestionIndex);
  const currentModule = useLessonStore((s) => s.currentModule);
  const isRecording = useLessonStore((s) => s.isRecording);
  const atesState = useLessonStore((s) => s.atesState);
  const messages = useLessonStore((s) => s.messages);
  const score = useLessonStore((s) => s.score);

  const lastMessage = messages[messages.length - 1];
  const totalQuestions = currentModule?.questions.length ?? 0;

  return (
    <View style={styles.overlay}>
      {/* Üst bilgi çubuğu */}
      <View style={styles.topBar}>
        <Text style={styles.progress}>
          Soru {currentQuestionIndex + 1}/{totalQuestions}
        </Text>
        <Text style={styles.stars}>⭐ {score}</Text>
      </View>

      {/* Ateş'in konuşma balonu */}
      {lastMessage && lastMessage.role === 'assistant' && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{lastMessage.content}</Text>
        </View>
      )}

      {/* Alt kontrol */}
      <View style={styles.bottomBar}>
        {atesState === 'loading' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>{t('lesson.atesThinking')}</Text>
          </View>
        ) : atesState === 'waiting' || atesState === 'idle' ? (
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={isRecording ? onStopPress : onMicPress}
            activeOpacity={0.7}
          >
            <Text style={styles.micIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
            <Text style={styles.micText}>
              {isRecording ? t('lesson.tapToStop') : t('lesson.tapToAnswer')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  progress: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stars: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  speechBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    maxWidth: '80%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  speechText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomBar: {
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#E53935',
  },
  micIcon: {
    fontSize: 36,
  },
  micText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
