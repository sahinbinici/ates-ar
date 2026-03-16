// services/demoMode.ts — API key olmadan test için mock AI yanıtları
import type { AiResponse } from '../types';

const DEMO_RESPONSES: AiResponse[] = [
  { correct: true, response: 'Harika! Doğru cevap, aferin sana! 🎉⭐' },
  { correct: false, response: 'Hmm, bir daha düşünelim! İpucu: parmakların ile say 🤔' },
  { correct: true, response: 'Süpersin! Tam isabet! 🦊💪' },
];

const DEMO_GREETINGS = [
  'Merhaba! Ben senin öğretmeninim! Bugün çok eğlenceli şeyler öğreneceğiz! 🎓✨',
  'Selam şampiyon! Hazır mısın harika bir derse? Hadi başlayalım! 🚀',
  'Hey! Bugün birlikte öğrenmek için sabırsızlanıyorum! 🌟',
];

let responseIndex = 0;

export function getDemoGreeting(): AiResponse {
  const greeting = DEMO_GREETINGS[Math.floor(Math.random() * DEMO_GREETINGS.length)];
  return { correct: true, response: greeting };
}

export function getDemoResponse(): AiResponse {
  const resp = DEMO_RESPONSES[responseIndex % DEMO_RESPONSES.length];
  responseIndex++;
  return resp;
}

export function getDemoTranscript(): string {
  return '3';
}

export const DEMO_MODE_ACTIVE = !process.env.EXPO_PUBLIC_SUPABASE_URL
  || process.env.EXPO_PUBLIC_APP_ENV === 'demo';
