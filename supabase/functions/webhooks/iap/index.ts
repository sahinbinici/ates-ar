/// <reference path="../../deno.d.ts" />
// supabase/functions/webhooks/iap/index.ts
// App Store / Google Play abonelik webhook'u
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const { platform, parentId, productId, transactionId, status } = body;

    // Platform doğrulama
    if (!['ios', 'android'].includes(platform)) {
      return new Response('Invalid platform', { status: 400 });
    }

    // Abonelik durumunu güncelle
    if (status === 'active') {
      await supabase.from('subscriptions').upsert({
        parent_id: parentId,
        platform,
        product_id: productId,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        original_tx_id: transactionId,
      });

      // Parent plan güncelle
      const plan = productId.includes('plus') ? 'plus' : 'family';
      await supabase
        .from('parents')
        .update({ sub_plan: plan })
        .eq('id', parentId);
    } else if (status === 'expired' || status === 'cancelled') {
      await supabase
        .from('subscriptions')
        .update({ status })
        .eq('parent_id', parentId)
        .eq('original_tx_id', transactionId);

      // Aktif abonelik kalmadıysa free'ye düşür
      const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('parent_id', parentId)
        .eq('status', 'active');

      if (!activeSubs || activeSubs.length === 0) {
        await supabase
          .from('parents')
          .update({ sub_plan: 'free' })
          .eq('id', parentId);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
