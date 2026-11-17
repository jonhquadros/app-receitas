import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { allowedOrigins, corsHeadersFor } from '../_shared/cors.ts';
import { json, logError, UPSTREAM_TIMEOUT_MS, UVVIPAY_BASE } from '../_shared/http.ts';

Deno.serve(async (req) => {
  const env = Deno.env.get.bind(Deno.env);
  const allowed = allowedOrigins(env('APP_ALLOWED_ORIGINS'));
  const origin = req.headers.get('origin');
  const cors = corsHeadersFor(origin, allowed);

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405, cors);
  if (!origin || !allowed.includes(origin)) return json({ error: 'Origem não permitida' }, 403, cors);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Não autenticado' }, 401, cors);
  const token = authHeader.slice(7).trim();

  const url = env('SUPABASE_URL')!;
  const anon = createClient(url, env('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const admin = createClient(url, env('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: userData, error: userErr } = await anon.auth.getUser(token);
  if (userErr || !userData.user) return json({ error: 'Sessão inválida' }, 401, cors);
  const userId = userData.user.id;

  // A assinatura é buscada pelo usuário autenticado, nunca pelo id enviado pelo cliente
  const { data: sub } = await admin.from('subscriptions')
    .select('uvvipay_subscription_id, status')
    .eq('user_id', userId).eq('payment_provider', 'uvvipay').maybeSingle();
  if (!sub?.uvvipay_subscription_id) return json({ error: 'Assinatura não encontrada' }, 404, cors);
  if (sub.status === 'canceled') return json({ status: 'canceled' }, 200, cors);

  let upstream: Response;
  try {
    upstream = await fetch(`${UVVIPAY_BASE}/v1/subscriptions/${sub.uvvipay_subscription_id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'client-id': env('UVVIPAY_CLIENT_ID')!, 'client-secret': env('UVVIPAY_CLIENT_SECRET')! },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (e) {
    logError('cancel_network', { name: (e as Error).name });
    return json({ error: 'Não foi possível cancelar agora. Tente novamente.' }, 502, cors);
  }

  if (!upstream.ok) {
    logError('cancel_upstream', { status: upstream.status });
    return json({ error: 'Não foi possível cancelar agora. Tente novamente.' }, 502, cors);
  }
  // O status final chega pelo webhook subscription.cancelled
  return json({ status: 'cancellation_requested' }, 202, cors);
});
