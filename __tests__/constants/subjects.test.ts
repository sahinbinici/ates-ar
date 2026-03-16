// __tests__/constants/subjects.test.ts — Ders tanımları testleri
import {
  SUBJECT_NAMES,
  SUBJECT_EMOJIS,
  SUBJECT_PROMPTS,
} from '../../constants/subjects';
import type { SubjectId } from '../../constants/subjects';

const ALL_SUBJECTS: SubjectId[] = ['math', 'turkish', 'science', 'social'];

describe('subjects constants', () => {
  it('tüm dersler SUBJECT_NAMES içinde tanımlı olmalı', () => {
    for (const s of ALL_SUBJECTS) {
      expect(SUBJECT_NAMES[s]).toBeTruthy();
    }
  });

  it('tüm dersler SUBJECT_EMOJIS içinde tanımlı olmalı', () => {
    for (const s of ALL_SUBJECTS) {
      expect(SUBJECT_EMOJIS[s]).toBeTruthy();
    }
  });

  it('tüm dersler SUBJECT_PROMPTS içinde tanımlı olmalı', () => {
    for (const s of ALL_SUBJECTS) {
      expect(SUBJECT_PROMPTS[s]).toBeTruthy();
      expect(SUBJECT_PROMPTS[s].length).toBeGreaterThan(10);
    }
  });

  it('SUBJECT_NAMES Türkçe isimler içermeli', () => {
    expect(SUBJECT_NAMES.math).toBe('Matematik');
    expect(SUBJECT_NAMES.turkish).toBe('Türkçe');
    expect(SUBJECT_NAMES.science).toBe('Fen Bilgisi');
    expect(SUBJECT_NAMES.social).toBe('Sosyal Bilgiler');
  });

  it('her emoji farklı olmalı', () => {
    const emojis = Object.values(SUBJECT_EMOJIS);
    const unique = new Set(emojis);
    expect(unique.size).toBe(emojis.length);
  });

  it('her prompt farklı olmalı', () => {
    const prompts = Object.values(SUBJECT_PROMPTS);
    const unique = new Set(prompts);
    expect(unique.size).toBe(prompts.length);
  });
});
