// Supabase Edge Function: create-checkout-session
// Cria uma sessão de checkout do Stripe em modo assinatura (subscription)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabaseClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Usuário inválido ou sessão expirada' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { priceId, plan, returnUrl } = await req.json();

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Impede múltiplas assinaturas recorrentes para o mesmo usuário.
    const { data: existingSub, error: existingSubError } = await supabaseAdmin
      .from('subscriptions')
      .select('status, stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSubError) {
      throw new Error('Não foi possível verificar a assinatura atual.');
    }

    if (
      existingSub &&
      ['active', 'trialing', 'past_due', 'incomplete'].includes(existingSub.status)
    ) {
      return new Response(
        JSON.stringify({ error: 'Você já possui uma assinatura ou pagamento em andamento. Gerencie sua assinatura atual antes de iniciar outra.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'priceId é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appOrigin = returnUrl || req.headers.get('origin') || 'https://ais-dev-fwoo3u7w34r33t6nw2ii2n-228482483965.us-east1.run.app';

    // Cria a sessão de checkout no Stripe em modo subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appOrigin}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: plan || 'mensal',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: plan || 'mensal',
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('❌ Erro ao criar sessão do Stripe:', err);
    return new Response(JSON.stringify({ error: err.message || 'Erro ao iniciar pagamento' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
