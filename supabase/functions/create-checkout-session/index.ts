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
} catch {}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const MONTHLY_PRICE_ID = 'price_1ULh9s3vKx2Flp1pfGYaYgec';
const ANNUAL_PRICE_ID = 'price_1ULhAO3vKx2Flp1pidFlSl0T';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!supabaseUrl || !publishableKey || !secretKey || !stripeSecretKey) {
      throw new Error('Configuração da função de checkout incompleta.');
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

    const supabaseAdmin = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { plan } = await req.json();
    if (plan !== 'mensal' && plan !== 'anual') {
      return new Response(JSON.stringify({ error: 'Plano de pagamento inválido.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: existingSub, error: existingSubError } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSubError) throw new Error('Não foi possível verificar a assinatura atual.');

    if (existingSub && ['active', 'trialing', 'past_due', 'incomplete'].includes(existingSub.status)) {
      return new Response(JSON.stringify({ error: 'Você já possui uma assinatura ou pagamento em andamento.' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const priceId = plan === 'anual' ? ANNUAL_PRICE_ID : MONTHLY_PRICE_ID;
    const appOrigin = Deno.env.get('APP_URL') || 'https://receitasnaturaisseuneco.netlify.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appOrigin}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}?canceled=true`,
      metadata: { user_id: user.id, plan },
      subscription_data: { metadata: { user_id: user.id, plan } },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erro ao criar sessão do Stripe:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Erro ao iniciar pagamento' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});