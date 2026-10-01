import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

async function main() {
  console.log('--- INICIANDO DIAGNÓSTICO DE PREPARAÇÃO ---');

  const clientAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Login Usuário A
  const { data: authA, error: errA } = await clientAnon.auth.signInWithPassword({
    email: 'usuario_a@teste.com',
    password: 'SenhaTeste123!',
  });

  if (errA || !authA?.session) {
    console.error('Falha login A:', errA);
    return;
  }
  console.log('✅ Usuário A autenticado:', authA.user.id);

  // 2. Login Usuário B
  const { data: authB, error: errB } = await clientAnon.auth.signInWithPassword({
    email: 'usuario_b@teste.com',
    password: 'SenhaTeste123!',
  });

  if (errB || !authB?.session) {
    console.error('Falha login B:', errB);
    return;
  }
  console.log('✅ Usuário B autenticado:', authB.user.id);

  // 3. Teste Edge Functions remotas
  try {
    const resCheckout = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authB.session.access_token}`,
      },
      body: JSON.stringify({ priceId: 'price_test_123', plan: 'mensal' }),
    });
    console.log('Status HTTP create-checkout-session:', resCheckout.status);
    const bodyCheckout = await resCheckout.text();
    console.log('Resposta create-checkout-session:', bodyCheckout.slice(0, 200));
  } catch (err: any) {
    console.log('Erro ao conectar em create-checkout-session:', err.message);
  }

  try {
    const resWebhook = await fetch(`${supabaseUrl}/functions/v1/stripe-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });
    console.log('Status HTTP stripe-webhook:', resWebhook.status);
    const bodyWebhook = await resWebhook.text();
    console.log('Resposta stripe-webhook:', bodyWebhook.slice(0, 200));
  } catch (err: any) {
    console.log('Erro ao conectar em stripe-webhook:', err.message);
  }

  // 4. Teste tabela subscriptions
  const clientB = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
  });

  const { data: subB, error: subBErr } = await clientB
    .from('subscriptions')
    .select('*')
    .eq('user_id', authB.user.id);

  console.log('Assinatura atual de B:', { subB, subBErr });
}

main().catch(console.error);
