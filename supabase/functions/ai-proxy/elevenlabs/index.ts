/// <reference path="../../deno.d.ts" />
// supabase/functions/ai-proxy/elevenlabs/index.ts
// ElevenLabs TTS proxy — metin alır, ses stream döndürür
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ATES_VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') ?? '';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  try {
    // JWT doğrulama
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return new Response('Text required', { status: 400 });
    }

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ATES_VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            speed: 1.1,
          },
        }),
      },
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      return new Response(errText, { status: elevenRes.status });
    }

    // Audio stream'i doğrudan istemciye aktar
    return new Response(elevenRes.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
