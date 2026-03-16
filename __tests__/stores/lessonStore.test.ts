// __tests__/stores/lessonStore.test.ts — Ders store birim testleri
import { useLessonStore } from '../../stores/lessonStore';
import type { LessonModule } from '../../types';

const mockModule: LessonModule = {
  id: 'math-test',
  title: 'Test Modülü',
  subject: 'math',
  grade: 1,
  starsRequired: 0,
  questions: [
    {
      id: 'q1',
      type: 'voice',
      prompt: 'Test soru 1',
      expectedAnswer: '3',
      maxAttempts: 3,
      sceneObjects: [],
    },
    {
      id: 'q2',
      type: 'voice',
      prompt: 'Test soru 2',
      expectedAnswer: '5',
      maxAttempts: 3,
      sceneObjects: [],
    },
  ],
};

describe('useLessonStore', () => {
  beforeEach(() => {
    useLessonStore.getState().resetLesson();
  });

  it('başlangıç durumu doğru olmalı', () => {
    const state = useLessonStore.getState();
    expect(state.currentModule).toBeNull();
    expect(state.currentQuestion).toBeNull();
    expect(state.atesState).toBe('idle');
    expect(state.score).toBe(0);
    expect(state.messages).toEqual([]);
    expect(state.isRecording).toBe(false);
  });

  it('startLesson ile ders başlarmalı', () => {
    useLessonStore.getState().startLesson(mockModule);
    const state = useLessonStore.getState();

    expect(state.currentModule).toBe(mockModule);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.currentQuestion).toBe(mockModule.questions[0]);
    expect(state.score).toBe(0);
    expect(state.sessionId).toBeTruthy();
    expect(state.startTime).toBeGreaterThan(0);
  });

  it('nextQuestion bir sonraki soruya geçmeli', () => {
    useLessonStore.getState().startLesson(mockModule);
    const result = useLessonStore.getState().nextQuestion();

    expect(result).toBe(true);
    expect(useLessonStore.getState().currentQuestionIndex).toBe(1);
    expect(useLessonStore.getState().currentQuestion?.id).toBe('q2');
    expect(useLessonStore.getState().attempts).toBe(0); // sıfırlanmalı
  });

  it('nextQuestion son soruda false döndürmeli', () => {
    useLessonStore.getState().startLesson(mockModule);
    useLessonStore.getState().nextQuestion(); // q2'ye geç
    const result = useLessonStore.getState().nextQuestion(); // soru kalmadı

    expect(result).toBe(false);
  });

  it('incrementScore skoru artırmalı', () => {
    useLessonStore.getState().startLesson(mockModule);
    useLessonStore.getState().incrementScore();
    useLessonStore.getState().incrementScore();

    expect(useLessonStore.getState().score).toBe(2);
  });

  it('incrementAttempts deneme sayısını artırmalı', () => {
    useLessonStore.getState().startLesson(mockModule);
    useLessonStore.getState().incrementAttempts();
    useLessonStore.getState().incrementAttempts();

    expect(useLessonStore.getState().attempts).toBe(2);
  });

  it('addMessage mesaj eklemeli', () => {
    useLessonStore.getState().startLesson(mockModule);
    useLessonStore.getState().addMessage({ role: 'assistant', content: 'Merhaba!' });
    useLessonStore.getState().addMessage({ role: 'user', content: '3' });

    expect(useLessonStore.getState().messages).toHaveLength(2);
    expect(useLessonStore.getState().messages[0].content).toBe('Merhaba!');
    expect(useLessonStore.getState().messages[1].role).toBe('user');
  });

  it('setAtesState durumu değiştirmeli', () => {
    useLessonStore.getState().setAtesState('talking');
    expect(useLessonStore.getState().atesState).toBe('talking');

    useLessonStore.getState().setAtesState('correct');
    expect(useLessonStore.getState().atesState).toBe('correct');
  });

  it('setRecording kayıt durumunu değiştirmeli', () => {
    useLessonStore.getState().setRecording(true);
    expect(useLessonStore.getState().isRecording).toBe(true);

    useLessonStore.getState().setRecording(false);
    expect(useLessonStore.getState().isRecording).toBe(false);
  });

  it('resetLesson herşeyi sıfırlamalı', () => {
    useLessonStore.getState().startLesson(mockModule);
    useLessonStore.getState().incrementScore();
    useLessonStore.getState().addMessage({ role: 'assistant', content: 'test' });
    useLessonStore.getState().resetLesson();

    const state = useLessonStore.getState();
    expect(state.currentModule).toBeNull();
    expect(state.score).toBe(0);
    expect(state.messages).toEqual([]);
    expect(state.sessionId).toBe('');
  });

  it('getElapsedSeconds geçen süreyi hesaplamalı', () => {
    useLessonStore.getState().startLesson(mockModule);
    // startTime ayarlandığından 0'dan büyük olmalı
    const elapsed = useLessonStore.getState().getElapsedSeconds();
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });
});
