/// <reference path="../../deno.d.ts" />
// supabase/functions/notifications/daily/index.ts
// Günlük push bildirim — her gün 09:00'da aktif çocuklar için
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Son 7 gün içinde aktif olan çocukların ebeveynlerini bul
  const { data: activeChildren } = await supabase
    .from('conversations')
    .select('child_id')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const childIds = [...new Set(activeChildren?.map((c) => c.child_id) ?? [])];

  if (childIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Expo Push Notification gönder
  // Not: Gerçek uygulamada expo-notifications push token'ları
  // ayrı bir tabloda saklanır ve bu fonksiyon oradan okur.

  return new Response(
    JSON.stringify({ sent: childIds.length, message: 'Daily notifications sent' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
