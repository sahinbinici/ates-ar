/// <reference path="../../deno.d.ts" />
// supabase/functions/ai-proxy/whisper/index.ts
// Whisper API proxy — ses dosyasını alır, transkripsiyonu döndürür
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // FormData'yı al ve Whisper'a ilet
    const formData = await req.formData();
    const audioFile = formData.get('file');
    const language = formData.get('language') ?? 'tr';

    if (!audioFile) {
      return new Response('Audio file required', { status: 400 });
    }

    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', language as string);

    const whisperRes = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')!}`,
        },
        body: whisperFormData,
      },
    );

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      return new Response(errText, { status: whisperRes.status });
    }

    const result = await whisperRes.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
