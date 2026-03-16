// __tests__/constants/lessons.test.ts — Ders içerik testleri
import { LESSON_MODULES, getModulesForGrade, getModuleById } from '../../constants/lessons';

describe('LESSON_MODULES', () => {
  it('en az 1 modül tanımlı olmalı', () => {
    expect(LESSON_MODULES.length).toBeGreaterThan(0);
  });

  it('her modülün benzersiz id si olmalı', () => {
    const ids = LESSON_MODULES.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('her modülün en az 1 sorusu olmalı', () => {
    for (const module of LESSON_MODULES) {
      expect(module.questions.length).toBeGreaterThan(0);
    }
  });

  it('her sorunun benzersiz id si olmalı', () => {
    const allQuestionIds = LESSON_MODULES.flatMap((m) =>
      m.questions.map((q) => q.id),
    );
    const uniqueIds = new Set(allQuestionIds);
    expect(uniqueIds.size).toBe(allQuestionIds.length);
  });

  it('her sorunun expectedAnswer değeri olmalı', () => {
    for (const module of LESSON_MODULES) {
      for (const q of module.questions) {
        expect(q.expectedAnswer).toBeTruthy();
      }
    }
  });

  it('her sorunun sceneObjects dizisi olmalı', () => {
    for (const module of LESSON_MODULES) {
      for (const q of module.questions) {
        expect(Array.isArray(q.sceneObjects)).toBe(true);
      }
    }
  });
});

describe('getModulesForGrade', () => {
  it('1. sınıf modüllerini döndürmeli', () => {
    const modules = getModulesForGrade(1);
    expect(modules.length).toBeGreaterThan(0);
    modules.forEach((m) => expect(m.grade).toBe(1));
  });

  it('4. sınıf modüllerini döndürmeli', () => {
    const modules = getModulesForGrade(4);
    expect(modules.length).toBeGreaterThan(0);
    modules.forEach((m) => expect(m.grade).toBe(4));
  });

  it('farklı sınıfların modülleri karışmamalı', () => {
    const grade1 = getModulesForGrade(1);
    const grade2 = getModulesForGrade(2);

    const grade1Ids = new Set(grade1.map((m) => m.id));
    const grade2Ids = new Set(grade2.map((m) => m.id));

    for (const id of grade1Ids) {
      expect(grade2Ids.has(id)).toBe(false);
    }
  });
});

describe('getModuleById', () => {
  it('var olan modülü bulmalı', () => {
    const module = getModuleById('math-1-counting');
    expect(module).toBeDefined();
    expect(module?.title).toBe('Sayıları Tanıyalım');
  });

  it('olmayan modül için undefined döndürmeli', () => {
    const module = getModuleById('non-existent');
    expect(module).toBeUndefined();
  });
});
