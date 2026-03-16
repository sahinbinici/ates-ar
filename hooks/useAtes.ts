// hooks/useAtes.ts — Ateş karakter durum makinesi
import { useCallback, useEffect, useRef } from 'react';
import { useLessonStore } from '../stores/lessonStore';
import type { AtesState } from '../types';

const STATE_DURATIONS: Partial<Record<AtesState, number>> = {
  correct: 2500,
  wrong: 2000,
  celebrating: 3000,
};

export function useAtes() {
  const atesState = useLessonStore((s) => s.atesState);
  const setAtesState = useLessonStore((s) => s.setAtesState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Geçici durumlar (correct, wrong, celebrating) otomatik idle'a döner
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const duration = STATE_DURATIONS[atesState];
    if (duration) {
      timerRef.current = setTimeout(() => {
        setAtesState('idle');
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [atesState, setAtesState]);

  const triggerCorrect = useCallback(() => setAtesState('correct'), [setAtesState]);
  const triggerWrong = useCallback(() => setAtesState('wrong'), [setAtesState]);
  const triggerTalking = useCallback(() => setAtesState('talking'), [setAtesState]);
  const triggerWaiting = useCallback(() => setAtesState('waiting'), [setAtesState]);
  const triggerExplaining = useCallback(() => setAtesState('explaining'), [setAtesState]);
  const triggerCelebrating = useCallback(() => setAtesState('celebrating'), [setAtesState]);
  const triggerLoading = useCallback(() => setAtesState('loading'), [setAtesState]);
  const triggerIdle = useCallback(() => setAtesState('idle'), [setAtesState]);

  return {
    atesState,
    triggerCorrect,
    triggerWrong,
    triggerTalking,
    triggerWaiting,
    triggerExplaining,
    triggerCelebrating,
    triggerLoading,
    triggerIdle,
  };
}
