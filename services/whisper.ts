// services/whisper.ts — Whisper API proxy üzerinden ses tanıma
import { supabase, SUPABASE_URL } from './supabase';
import { getDemoTranscript } from './demoMode';

/**
 * Ses dosyasını Supabase Edge Function proxy'sine gönderir.
 * Whisper API anahtarı mobil uygulamada BULUNMAZ.
 */
export async function speechToText(audioUri: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.warn('Oturum bulunamadı — demo moda geçiliyor');
    return getDemoTranscript();
  }

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'audio.m4a',
  } as unknown as Blob);
  formData.append('language', 'tr');

  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/ai-proxy/whisper`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      },
    );

    if (!res.ok) {
      console.warn(`Whisper proxy hatası: ${res.status} — demo moda geçiliyor`);
      return getDemoTranscript();
    }

    const data = await res.json();
    return data.text;
  } catch (err) {
    console.warn('Whisper ağ hatası — demo moda geçiliyor', err);
    return getDemoTranscript();
  }
}
