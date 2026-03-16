// hooks/useLesson.ts — Ders akış yönetimi (tam döngü)
import { useCallback, useRef } from 'react';
import { useLessonStore } from '../stores/lessonStore';
import { useAuthStore } from '../stores/authStore';
import { useAtes } from './useAtes';
import { useAudio } from './useAudio';
import { useProgress } from './useProgress';
import { askCharacter } from '../services/claude';
import { speechToText } from '../services/whisper';
import { textToSpeech } from '../services/elevenlabs';
import type { LessonModule, Message, Character, SubjectId } from '../types';
import { getCharacterById, DEFAULT_CHARACTER_ID } from '../constants/characters';

export function useLesson() {
  const store = useLessonStore();
  const activeChild = useAuthStore((s) => s.activeChild);
  const ates = useAtes();
  const { startRecording, stopRecording } = useAudio();
  const { saveProgress } = useProgress();
  const stopResolveRef = useRef<(() => void) | null>(null);

  const subjectRef = useRef<SubjectId>('math');

  const playAudio = useCallback(async (uri: string) => {
    const { Audio } = require('expo-av') as typeof import('expo-av');
    const { sound } = await Audio.Sound.createAsync({ uri });
    ates.triggerTalking();
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if ('didJustFinish' in status && status.didJustFinish) {
        ates.triggerIdle();
        sound.unloadAsync();
      }
    });
  }, [ates]);

  const speakAndAnimate = useCallback(
    async (text: string) => {
      try {
        const audioUri = await textToSpeech(text);
        await playAudio(audioUri);
      } catch {
        // TTS başarısız olursa sadece metin göster
        ates.triggerTalking();
        await new Promise((r) => setTimeout(r, 2000));
        ates.triggerIdle();
      }
    },
    [playAudio, ates],
  );

  const beginLesson = useCallback(
    async (module: LessonModule, character?: Character, subject?: SubjectId) => {
      if (!activeChild) return;
      const ch = character ?? getCharacterById(activeChild.selectedCharacterId ?? DEFAULT_CHARACTER_ID)!;
      const sub = subject ?? module.subject;
      subjectRef.current = sub;
      store.startLesson(module);

      ates.triggerLoading();
      const greeting = await askCharacter(
        ch,
        [],
        activeChild.name,
        activeChild.grade,
        sub,
      );
      store.addMessage({ role: 'assistant', content: greeting.response });
      await speakAndAnimate(greeting.response);

      // İlk soruyu sor
      if (store.currentQuestion) {
        const questionMsg = await askCharacter(
          ch,
          [{ role: 'assistant', content: greeting.response }],
          activeChild.name,
          activeChild.grade,
          sub,
        );
        store.addMessage({ role: 'assistant', content: questionMsg.response });
        await speakAndAnimate(questionMsg.response);
        ates.triggerWaiting();
      }
    },
    [activeChild, store, ates, speakAndAnimate],
  );

  const handleVoiceAnswer = useCallback(async () => {
    if (!activeChild) return;
    const ch = getCharacterById(activeChild.selectedCharacterId ?? DEFAULT_CHARACTER_ID)!;

    // Kayıt başlat
    store.setRecording(true);
    const recordingObj = await startRecording();
    if (!recordingObj) {
      store.setRecording(false);
      return;
    }

    // 10 saniye bekle veya kullanıcı durdursun
    await new Promise<void>((resolve) => {
      stopResolveRef.current = resolve;
      setTimeout(resolve, 10_000);
    });
    stopResolveRef.current = null;
    store.setRecording(false);

    const audioUri = await stopRecording(recordingObj);
    if (!audioUri) return;

    ates.triggerLoading();

    // Ses → metin
    const transcript = await speechToText(audioUri);
    store.addMessage({ role: 'user', content: transcript });

    // Claude değerlendir
    const allMessages: Message[] = [
      ...store.messages,
      { role: 'user', content: transcript },
    ];
    const result = await askCharacter(ch, allMessages, activeChild.name, activeChild.grade, subjectRef.current);
    store.addMessage({ role: 'assistant', content: result.response });

    if (result.correct) {
      ates.triggerCorrect();
      store.incrementScore();
      await speakAndAnimate(result.response);

      // Sonraki soru
      const hasNext = store.nextQuestion();
      if (!hasNext) {
        // Bölüm bitti
        ates.triggerCelebrating();
        await saveProgress(
          store.currentModule!.id,
          store.score + 1,
          store.getElapsedSeconds(),
          true,
        );
      } else {
        ates.triggerWaiting();
      }
    } else {
      ates.triggerWrong();
      store.incrementAttempts();
      await speakAndAnimate(result.response);

      if (store.attempts >= 3) {
        ates.triggerExplaining();
        // Sonraki soruya geç
        store.nextQuestion();
      } else {
        ates.triggerWaiting();
      }
    }
  }, [activeChild, store, ates, speakAndAnimate, startRecording, stopRecording, saveProgress]);

  const endLesson = useCallback(async () => {
    if (store.currentModule) {
      await saveProgress(
        store.currentModule.id,
        store.score,
        store.getElapsedSeconds(),
        false,
      );
    }
    store.resetLesson();
  }, [store, saveProgress]);

  const stopVoiceAnswer = useCallback(() => {
    stopResolveRef.current?.();
  }, []);

  return {
    beginLesson,
    handleVoiceAnswer,
    stopVoiceAnswer,
    endLesson,
    speakAndAnimate,
  };
}
