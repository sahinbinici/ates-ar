// types/index.ts — Ateş AR Global TypeScript Tipleri
import type { SubjectId } from '../constants/subjects';
export type { SubjectId };

export interface Character {
  id: string;
  name: string;
  animal: string;
  personality: string;
  starsRequired: number;
  isPremium: boolean;
  color: string;
  defaultSubject: SubjectId;
  subjectExpertise: SubjectId[];
  systemPrompt: (childName: string, grade: number, subject: SubjectId) => string;
}

export interface LessonSession {
  childId: string;
  moduleId: string;
  characterId: string;
  subjectId: SubjectId;
  startedAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  grade: 1 | 2 | 3 | 4;
  totalStars: number;
  avatarIdx: number;
  selectedCharacterId: string;
  createdAt: string;
}

export interface LessonModule {
  id: string;
  title: string;
  subject: SubjectId;
  grade: 1 | 2 | 3 | 4;
  starsRequired: number;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'voice' | 'touch' | 'drag';
  prompt: string;
  expectedAnswer: string;
  sceneObjects: ARObject[];
  maxAttempts: number;
}

export interface ARObject {
  id: string;
  model: string;
  position: [number, number, number];
  scale: [number, number, number];
  interactive: boolean;
}

export type AtesState =
  | 'idle'
  | 'talking'
  | 'waiting'
  | 'correct'
  | 'wrong'
  | 'explaining'
  | 'celebrating'
  | 'loading';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiResponse {
  correct: boolean;
  response: string;
}

export interface Progress {
  id: string;
  childId: string;
  moduleId: string;
  score: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
  timeSpentSec: number;
  lastPlayedAt: string;
}

export interface Parent {
  id: string;
  email: string;
  fullName: string | null;
  subPlan: 'free' | 'family' | 'plus';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  parentId: string;
  platform: 'ios' | 'android' | 'web';
  productId: string;
  status: 'active' | 'expired' | 'cancelled';
  startedAt: string;
  expiresAt: string;
  originalTxId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  childId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  moduleId: string;
  createdAt: string;
}

export interface WeeklySummary {
  total_sessions: number;
  total_time_min: number;
  modules_completed: number;
  stars_earned: number;
  best_module: string | null;
}

export type SubPlan = 'free' | 'family' | 'plus';

export const PLAN_LIMITS: Record<SubPlan, { modules: number; children: number; dailyMinutes: number }> = {
  free: { modules: 3, children: 1, dailyMinutes: 10 },
  family: { modules: Infinity, children: 2, dailyMinutes: Infinity },
  plus: { modules: Infinity, children: 5, dailyMinutes: Infinity },
};
