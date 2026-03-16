// services/elevenlabs.ts — ElevenLabs TTS proxy üzerinden ses üretimi
import { File, Paths } from 'expo-file-system';
import { supabase, SUPABASE_URL } from './supabase';

/**
 * Metin → ses dönüşümü. Edge Function proxy üzerinden çağrılır.
 * ElevenLabs API anahtarı mobil uygulamada BULUNMAZ.
 */
export async function textToSpeech(text: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Oturum bulunamadı');

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/ai-proxy/elevenlabs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text }),
    },
  );

  if (!res.ok) {
    throw new Error(`ElevenLabs proxy hatası: ${res.status}`);
  }

  // Ses verisini yerel dosyaya kaydet
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const file = new File(Paths.cache, `ates_tts_${Date.now()}.mp3`);
  file.write(bytes);

  return file.uri;
}
