import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const publishableKeysRaw = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '';
const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS') || '';
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

let publishableKey = '';
let secretKey = '';

try {
  publishableKey = JSON.parse(publishableKeysRaw)?.default || '';
  secretKey = JSON.parse(secretKeysRaw)?.default || '';
} catch (err) {
  console.error('❌ Erro ao ler chaves do Supabase:', err instanceof Error ? err.message : String(err));
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!supabaseUrl || !publishableKey || !secretKey || !stripeSecretKey) {
      throw new Error('Configuração da função de verificação incompleta.');
    }

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const supabaseUser = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user?.id) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado ou sessão expirada.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return new Response(JSON.stringify({ error: 'Sessão de checkout inválida.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    const sessionUserId = session.client_reference_id || session.metadata?.user_id || '';

    if (sessionUserId !== user.id) {
      return new Response(JSON.stringify({ error: 'A sessão de checkout não pertence ao usuário autenticado.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return new Response(JSON.stringify({
        success: false, status: session.status, paymentStatus: session.payment_status,
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subscription = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'Assinatura não encontrada para o checkout.' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['active', 'trialing'].includes(subscription.status)) {
      return new Response(JSON.stringify({ success: false, status: subscription.status }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const periodEnd = subscription.items.data[0]?.current_period_end;
    if (!periodEnd) {
      return new Response(JSON.stringify({ error: 'Período da assinatura não encontrado.' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const plan = subscription.metadata?.plan === 'anual' ? 'anual' : 'mensal';
    const supabaseAdmin = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: upsertError } = await supabaseAdmin.from('subscriptions').upsert({
      user_id: user.id,
      status: subscription.status,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      stripe_subscription_id: subscription.id,
      plano: plan,
      periodo_atual_fim: new Date(periodEnd * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
      manual_override: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('❌ Erro ao sincronizar assinatura após checkout:', {
        code: upsertError.code, message: upsertError.message,
      });
      throw new Error('Não foi possível liberar a assinatura.');
    }

    return new Response(JSON.stringify({
      success: true,
      status: subscription.status,
      plan,
      currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('❌ Erro ao verificar Checkout Session:', err);
    const message = err instanceof Error ? err.message : 'Erro ao verificar pagamento';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
