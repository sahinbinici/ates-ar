/// <reference path="../deno.d.ts" />
// supabase/functions/ai-proxy/index.ts — Tek giriş noktası, URL path'e göre yönlendirir
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

// ─── Rate limiter ────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ─── Auth helper ─────────────────────────────────────────
async function authenticate(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ─── Claude handler ──────────────────────────────────────
async function handleClaude(req: Request, userId: string) {
  if (checkRateLimit(userId)) {
    return new Response('Rate limited', { status: 429 });
  }

  const { childName, grade, messages, systemPrompt } = await req.json();

  const defaultPrompt = `Sen Ateş'sin — neşeli, çılgın, sevimli bir tilki öğretmen.
${childName} adında ${grade}. sınıf öğrencisine matematik öğretiyorsun.
KURALLAR:
- Her zaman Türkçe konuş
- Maksimum 2 kısa cümle söyle
- Cevaplarını JSON formatında dön: { "correct": bool, "response": string }`;

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('CLAUDE_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: typeof systemPrompt === 'string' ? systemPrompt : defaultPrompt,
      messages: messages ?? [],
    }),
  });

  if (!claudeRes.ok) {
    const errText = await claudeRes.text();
    return new Response(errText, { status: claudeRes.status });
  }

  const claudeData = await claudeRes.json();
  const responseText = claudeData.content?.[0]?.text ?? '';

  try {
    const parsed = JSON.parse(responseText);
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ correct: false, response: responseText }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }
}

// ─── Whisper handler ─────────────────────────────────────
async function handleWhisper(req: Request) {
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
}

// ─── ElevenLabs handler ──────────────────────────────────
async function handleElevenLabs(req: Request) {
  const { text } = await req.json();
  if (!text) {
    return new Response('Text required', { status: 400 });
  }

  const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID') ?? '';
  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
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

  return new Response(elevenRes.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// ─── Router ──────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const user = await authenticate(req);
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop(); // claude | whisper | elevenlabs

    switch (path) {
      case 'claude':
        return await handleClaude(req, user.id);
      case 'whisper':
        return await handleWhisper(req);
      case 'elevenlabs':
        return await handleElevenLabs(req);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown route: ${path}` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
