// stores/lessonStore.ts — Aktif ders durumu yönetimi
import { create } from 'zustand';
import type { AtesState, Message, Question, LessonModule } from '../types';

interface LessonState {
  currentModule: LessonModule | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  atesState: AtesState;
  messages: Message[];
  score: number;
  attempts: number;
  sessionId: string;
  isRecording: boolean;
  startTime: number;

  startLesson: (module: LessonModule) => void;
  setAtesState: (state: AtesState) => void;
  addMessage: (message: Message) => void;
  nextQuestion: () => boolean;
  incrementScore: () => void;
  incrementAttempts: () => void;
  setRecording: (recording: boolean) => void;
  resetLesson: () => void;
  getElapsedSeconds: () => number;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentModule: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  atesState: 'idle',
  messages: [],
  score: 0,
  attempts: 0,
  sessionId: '',
  isRecording: false,
  startTime: 0,

  startLesson: (module) =>
    set({
      currentModule: module,
      currentQuestionIndex: 0,
      currentQuestion: module.questions[0] ?? null,
      atesState: 'idle',
      messages: [],
      score: 0,
      attempts: 0,
      sessionId: generateSessionId(),
      isRecording: false,
      startTime: Date.now(),
    }),

  setAtesState: (state) => set({ atesState: state }),

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  nextQuestion: () => {
    const { currentModule, currentQuestionIndex } = get();
    if (!currentModule) return false;

    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= currentModule.questions.length) return false;

    set({
      currentQuestionIndex: nextIdx,
      currentQuestion: currentModule.questions[nextIdx],
      attempts: 0,
    });
    return true;
  },

  incrementScore: () => set((s) => ({ score: s.score + 1 })),

  incrementAttempts: () => set((s) => ({ attempts: s.attempts + 1 })),

  setRecording: (recording) => set({ isRecording: recording }),

  resetLesson: () =>
    set({
      currentModule: null,
      currentQuestionIndex: 0,
      currentQuestion: null,
      atesState: 'idle',
      messages: [],
      score: 0,
      attempts: 0,
      sessionId: '',
      isRecording: false,
      startTime: 0,
    }),

  getElapsedSeconds: () => {
    const { startTime } = get();
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },
}));
