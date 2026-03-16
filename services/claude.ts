// services/claude.ts — Claude API proxy üzerinden AI öğretmen
import { supabase, SUPABASE_URL } from './supabase';
import type { Message, AiResponse, Character, SubjectId } from '../types';
import { getCharacterById } from '../constants/characters';
import { getDemoGreeting, getDemoResponse } from './demoMode';

/**
 * Tüm Claude çağrıları Supabase Edge Function proxy üzerinden yapılır.
 * API anahtarı mobil uygulamada BULUNMAZ.
 */
export async function askCharacter(
  character: Character,
  messages: Message[],
  childName: string,
  grade: number,
  subject: SubjectId,
): Promise<AiResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.warn('Oturum bulunamadı — demo moda geçiliyor');
    return messages.length === 0 ? getDemoGreeting() : getDemoResponse();
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/ai-proxy/claude`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          childName,
          grade,
          messages,
          systemPrompt: character.systemPrompt(childName, grade, subject),
        }),
      },
    );

    if (!res.ok) {
      console.warn(`Claude proxy hatası: ${res.status} — demo moda geçiliyor`);
      return messages.length === 0 ? getDemoGreeting() : getDemoResponse();
    }

    const data = await res.json();
    return data as AiResponse;
  } catch (err) {
    console.warn('Claude ağ hatası — demo moda geçiliyor', err);
    return messages.length === 0 ? getDemoGreeting() : getDemoResponse();
  }
}

/** @deprecated askCharacter kullanın */
export async function askAtes(
  messages: Message[],
  childName: string,
  grade: number,
): Promise<AiResponse> {
  const ates = getCharacterById('ates')!;
  return askCharacter(ates, messages, childName, grade, 'math');
}
