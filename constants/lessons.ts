// constants/lessons.ts — Ders içerik tanımları
import type { LessonModule } from '../types';

export const LESSON_MODULES: LessonModule[] = [
  // ── 1. Sınıf Matematik ──
  {
    id: 'math-1-counting',
    title: 'Sayıları Tanıyalım',
    subject: 'math',
    grade: 1,
    starsRequired: 0,
    questions: [
      {
        id: 'q1-count-apples',
        type: 'voice',
        prompt: 'Masada kaç tane elma var?',
        expectedAnswer: '3',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'apple1', model: 'apple.glb', position: [-0.2, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
          { id: 'apple2', model: 'apple.glb', position: [0, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
          { id: 'apple3', model: 'apple.glb', position: [0.2, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
        ],
      },
      {
        id: 'q2-count-stars',
        type: 'voice',
        prompt: 'Gökyüzünde kaç yıldız parlıyor?',
        expectedAnswer: '5',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'star1', model: 'star.glb', position: [-0.3, 0.3, -1.5], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'star2', model: 'star.glb', position: [-0.1, 0.4, -1.5], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'star3', model: 'star.glb', position: [0.1, 0.35, -1.5], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'star4', model: 'star.glb', position: [0.3, 0.3, -1.5], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'star5', model: 'star.glb', position: [0.0, 0.5, -1.5], scale: [0.08, 0.08, 0.08], interactive: false },
        ],
      },
    ],
  },
  {
    id: 'math-1-addition',
    title: 'Toplama Yapalım',
    subject: 'math',
    grade: 1,
    starsRequired: 2,
    questions: [
      {
        id: 'q1-add-simple',
        type: 'voice',
        prompt: '2 elma ile 1 elma topla. Kaç elma oldu?',
        expectedAnswer: '3',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'apple-a1', model: 'apple.glb', position: [-0.3, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
          { id: 'apple-a2', model: 'apple.glb', position: [-0.1, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
          { id: 'plus-sign', model: 'plus.glb', position: [0.05, 0, -1], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'apple-b1', model: 'apple.glb', position: [0.2, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
        ],
      },
      {
        id: 'q2-add-medium',
        type: 'voice',
        prompt: '3 artı 2 kaç eder?',
        expectedAnswer: '5',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'block1', model: 'block.glb', position: [-0.3, 0, -1], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'block2', model: 'block.glb', position: [-0.15, 0, -1], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'block3', model: 'block.glb', position: [0, 0, -1], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'plus2', model: 'plus.glb', position: [0.1, 0, -1], scale: [0.06, 0.06, 0.06], interactive: false },
          { id: 'block4', model: 'block.glb', position: [0.2, 0, -1], scale: [0.08, 0.08, 0.08], interactive: false },
          { id: 'block5', model: 'block.glb', position: [0.35, 0, -1], scale: [0.08, 0.08, 0.08], interactive: false },
        ],
      },
    ],
  },

  // ── 2. Sınıf Matematik ──
  {
    id: 'math-2-subtraction',
    title: 'Çıkarma İşlemi',
    subject: 'math',
    grade: 2,
    starsRequired: 5,
    questions: [
      {
        id: 'q1-sub-simple',
        type: 'voice',
        prompt: '5 elmadan 2 elmayı yersek kaç elma kalır?',
        expectedAnswer: '3',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'a1', model: 'apple.glb', position: [-0.3, 0, -1], scale: [0.1, 0.1, 0.1], interactive: true },
          { id: 'a2', model: 'apple.glb', position: [-0.15, 0, -1], scale: [0.1, 0.1, 0.1], interactive: true },
          { id: 'a3', model: 'apple.glb', position: [0, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
          { id: 'a4', model: 'apple.glb', position: [0.15, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
          { id: 'a5', model: 'apple.glb', position: [0.3, 0, -1], scale: [0.1, 0.1, 0.1], interactive: false },
        ],
      },
    ],
  },
  {
    id: 'math-2-multiplication',
    title: 'Çarpma ile Tanışalım',
    subject: 'math',
    grade: 2,
    starsRequired: 8,
    questions: [
      {
        id: 'q1-mul-intro',
        type: 'voice',
        prompt: '2 tabakta 3er elma var. Toplam kaç elma var?',
        expectedAnswer: '6',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'plate1', model: 'plate.glb', position: [-0.2, 0, -1], scale: [0.15, 0.15, 0.15], interactive: false },
          { id: 'plate2', model: 'plate.glb', position: [0.2, 0, -1], scale: [0.15, 0.15, 0.15], interactive: false },
        ],
      },
    ],
  },

  // ── 3. Sınıf ──
  {
    id: 'math-3-fractions',
    title: 'Kesirlerle Tanışalım',
    subject: 'math',
    grade: 3,
    starsRequired: 12,
    questions: [
      {
        id: 'q1-fraction-half',
        type: 'voice',
        prompt: 'Bir pizzayı ikiye böldük. Her parça ne kadar?',
        expectedAnswer: 'yarım',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'pizza-half1', model: 'pizza_half.glb', position: [-0.15, 0, -1], scale: [0.2, 0.2, 0.2], interactive: true },
          { id: 'pizza-half2', model: 'pizza_half.glb', position: [0.15, 0, -1], scale: [0.2, 0.2, 0.2], interactive: true },
        ],
      },
    ],
  },

  // ── 4. Sınıf ──
  {
    id: 'math-4-geometry',
    title: 'Geometrik Şekiller',
    subject: 'math',
    grade: 4,
    starsRequired: 20,
    questions: [
      {
        id: 'q1-shapes',
        type: 'voice',
        prompt: 'Bu şeklin kaç kenarı var?',
        expectedAnswer: '4',
        maxAttempts: 3,
        sceneObjects: [
          { id: 'square', model: 'square.glb', position: [0, 0, -1], scale: [0.3, 0.3, 0.3], interactive: true },
        ],
      },
    ],
  },
];

export function getModulesForGrade(grade: 1 | 2 | 3 | 4): LessonModule[] {
  return LESSON_MODULES.filter((m) => m.grade === grade);
}

export function getModuleById(id: string): LessonModule | undefined {
  return LESSON_MODULES.find((m) => m.id === id);
}
