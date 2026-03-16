/// <reference path="../../deno.d.ts" />
// supabase/functions/ai-proxy/claude/index.ts
// Claude API proxy — API anahtarını mobil uygulamadan gizler
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = (childName: string, grade: number) => `
Sen Ateş'sin — neşeli, çılgın, sevimli bir tilki öğretmen.
${childName} adında ${grade}. sınıf öğrencisine matematik öğretiyorsun.

KURALLAR:
- Her zaman Türkçe konuş
- Maksimum 2 kısa cümle söyle
- Çok heyecanlı ve eğlenceli ol
- '${childName}' diye hitap et, asla 'sen' deme
- Yanlış cevaba hiç üzülme, her zaman teşvik et
- Emojilerle konuş: 🦊 ⭐ 🎉 🎯
- Cevaplarını JSON formatında dön: { "correct": bool, "response": string }
`;

// Basit bellek-içi rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // dakikada 30 istek
const RATE_WINDOW = 60_000; // 1 dakika

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

serve(async (req: Request) => {
  // CORS
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Rate limiting
    if (checkRateLimit(user.id)) {
      return new Response('Rate limited', { status: 429 });
    }

    const { childName, grade, messages, systemPrompt } = await req.json();

    // Claude API çağrısı
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
        system: typeof systemPrompt === 'string' ? systemPrompt : SYSTEM_PROMPT(childName, grade),
        messages: messages ?? [],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return new Response(errText, { status: claudeRes.status });
    }

    const claudeData = await claudeRes.json();
    const responseText = claudeData.content?.[0]?.text ?? '';

    // JSON parse denemesi
    try {
      const parsed = JSON.parse(responseText);
      return new Response(JSON.stringify(parsed), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // JSON değilse ham metin olarak dön
      return new Response(
        JSON.stringify({ correct: false, response: responseText }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
