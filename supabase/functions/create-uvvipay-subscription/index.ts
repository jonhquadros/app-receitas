import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { allowedOrigins, corsHeadersFor } from '../_shared/cors.ts';
import { json, logError, UPSTREAM_TIMEOUT_MS, UVVIPAY_BASE } from '../_shared/http.ts';
import { isValidCep, isValidCnpj, isValidCpf, isValidPhone, isValidUf, isValidUuid, onlyDigits } from '../_shared/validate.ts';
import { statusFromUvviPay } from '../_shared/status.ts';

// Formas de pagamento aceitas. Cartão ainda não: exige aprovação de escopo PCI.
// Confirmado pelo suporte: pix_type fica dentro de payment_methods (no topo a API responde 400).
//   pix_automatic -> pix_type "automatic" (autoriza uma vez, UvviPay cobra sozinha a cada ciclo)
//   pix_cycle     -> pix_type "immediate" (um Pix novo a cada ciclo)
type PixMethod = 'pix_automatic' | 'pix_cycle';
const PIX_TYPE_BY_METHOD: Record<PixMethod, 'automatic' | 'immediate'> = {
  pix_automatic: 'automatic',
  pix_cycle: 'immediate',
};

type PlanKey = 'mensal' | 'anual';

Deno.serve(async (req) => {
  const env = Deno.env.get.bind(Deno.env);
  const allowed = allowedOrigins(env('APP_ALLOWED_ORIGINS'));
  const origin = req.headers.get('origin');
  const cors = corsHeadersFor(origin, allowed);

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405, cors);
  if (!origin || !allowed.includes(origin)) return json({ error: 'Origem não permitida' }, 403, cors);

  // 1. Autenticação do usuário
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Não autenticado' }, 401, cors);
  const token = authHeader.slice(7).trim();

  const url = env('SUPABASE_URL')!;
  const anon = createClient(url, env('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const admin = createClient(url, env('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: userData, error: userErr } = await anon.auth.getUser(token);
  if (userErr || !userData.user) return json({ error: 'Sessão inválida' }, 401, cors);
  const userId = userData.user.id;

  // 2. Limite de tentativas: 5 por minuto por usuário
  const { data: allowedRate, error: rateErr } = await admin.rpc('consume_rate_limit', {
    p_key: `checkout:${userId}`, p_limit: 5, p_window_seconds: 60,
  });
  if (rateErr) { logError('rate_limit', { code: rateErr.code }); return json({ error: 'Tente novamente em instantes' }, 503, cors); }
  if (allowedRate === false) return json({ error: 'Muitas tentativas. Aguarde um minuto.' }, 429, cors);

  // 3. Validação do corpo (nada de valores vindos do cliente)
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Requisição inválida' }, 400, cors); }

  const plan = body?.plan as PlanKey;
  if (plan !== 'mensal' && plan !== 'anual') return json({ error: 'Plano inválido' }, 422, cors);

  // Forma de pagamento. Sem o campo, mantém o comportamento anterior (Pix Automático).
  const method = (body?.method ?? 'pix_automatic') as PixMethod;
  if (method !== 'pix_automatic' && method !== 'pix_cycle') {
    return json({ error: 'Forma de pagamento inválida' }, 422, cors);
  }
  const pixType = PIX_TYPE_BY_METHOD[method];

  if (typeof body?.client_request_id !== 'string' || !isValidUuid(body.client_request_id)) {
    return json({ error: 'Identificador da requisição inválido' }, 422, cors);
  }
  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim().toLowerCase();
  const phone = onlyDigits(String(body?.phone ?? ''));
  const docType = body?.document?.type;
  const docNumber = onlyDigits(String(body?.document?.number ?? ''));
  const addr = body?.address ?? {};

  if (name.length < 3 || name.length > 120) return json({ error: 'Nome inválido' }, 422, cors);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return json({ error: 'E-mail inválido' }, 422, cors);
  if (!isValidPhone(phone)) return json({ error: 'Telefone inválido' }, 422, cors);
  if (docType === 'cpf' && !isValidCpf(docNumber)) return json({ error: 'CPF inválido' }, 422, cors);
  if (docType === 'cnpj' && !isValidCnpj(docNumber)) return json({ error: 'CNPJ inválido' }, 422, cors);
  if (docType !== 'cpf' && docType !== 'cnpj') return json({ error: 'Documento inválido' }, 422, cors);

  // Endereço exigido nas duas formas, de propósito. Só o Pix Automático obriga a UvviPay a receber o
  // endereço, mas ela não tem endpoint para atualizar o cadastro depois. Se o cliente começasse no
  // Pix a cada ciclo sem endereço, nunca poderia migrar para o Pix Automático (erro UVV154361).
  if (!isValidCep(String(addr.zip_code ?? ''))) return json({ error: 'CEP inválido' }, 422, cors);
  if (!isValidUf(String(addr.state ?? ''))) return json({ error: 'UF inválida' }, 422, cors);
  for (const f of ['street', 'street_number', 'neighborhood', 'city']) {
    if (!String(addr[f] ?? '').trim()) return json({ error: 'Endereço incompleto' }, 422, cors);
  }

  const planId = plan === 'mensal'
    ? env('UVVIPAY_PLAN_ID_MENSAL')
    : env('UVVIPAY_PLAN_ID_ANUAL');
  if (!planId) { logError('config', { missing: plan === 'mensal' ? 'UVVIPAY_PLAN_ID_MENSAL' : 'UVVIPAY_PLAN_ID_ANUAL' }); return json({ error: 'Serviço indisponível' }, 500, cors); }

  // 4. Idempotência: mesma requisição devolve o mesmo resultado
  const payloadForHash = JSON.stringify({ plan, method, name, email, phone, docType, docNumber, addr });
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payloadForHash));
  const payloadHash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');

  const { error: insErr } = await admin.from('uvvipay_creation_requests').insert({
    user_id: userId, idempotency_key: body.client_request_id, payload_hash: payloadHash,
  });
  if (insErr) {
    if (insErr.code !== '23505') { logError('idem_insert', { code: insErr.code }); return json({ error: 'Tente novamente em instantes' }, 503, cors); }
    const { data: prev } = await admin.from('uvvipay_creation_requests')
      .select('payload_hash, subscription_id')
      .eq('user_id', userId).eq('idempotency_key', body.client_request_id).maybeSingle();
    if (!prev || prev.payload_hash !== payloadHash) return json({ error: 'Requisição duplicada com dados diferentes' }, 409, cors);
    if (!prev.subscription_id) return json({ error: 'Pedido em andamento. Aguarde um instante.' }, 409, cors);
    const { data: sub } = await admin.from('subscriptions').select('status').eq('user_id', userId).maybeSingle();
    return json({ subscription_id: prev.subscription_id, status: sub?.status ?? 'incomplete', replayed: true }, 200, cors);
  }

  // 5. Cliente: reaproveita o customer_id salvo, senão envia o bloco customer uma vez
  const { data: existing } = await admin.from('subscriptions')
    .select('uvvipay_customer_id').eq('user_id', userId).maybeSingle();

  const customerPart = existing?.uvvipay_customer_id
    ? { customer_id: existing.uvvipay_customer_id }
    : {
        customer: {
          external_customer_id: userId,
          name, email, phone,
          document: { number: docNumber, type: docType },
          address: {
            zip_code: onlyDigits(String(addr.zip_code)),
            street: String(addr.street).trim(),
            street_number: String(addr.street_number).trim(),
            neighborhood: String(addr.neighborhood).trim(),
            city: String(addr.city).trim(),
            state: String(addr.state).toUpperCase(),
            country: 'BR',
          },
        },
      };

  const payload = {
    subscription_plan_id: planId,
    grace_period_days: 3,
    transaction_idempotency_id: `sub-${userId}-${body.client_request_id}`,
    ...customerPart,
    payment_methods: { type: 'pix', pix_type: pixType, main_payment_method: true },
  };

  // 6. Chamada à UvviPay (somente backend, com timeout)
  let upstream: Response;
  try {
    upstream = await fetch(`${UVVIPAY_BASE}/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': env('UVVIPAY_CLIENT_ID')!,
        'client-secret': env('UVVIPAY_CLIENT_SECRET')!,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (e) {
    logError('upstream_network', { name: (e as Error).name });
    await admin.from('uvvipay_creation_requests').delete().eq('user_id', userId).eq('idempotency_key', body.client_request_id);
    return json({ error: 'Não foi possível contactar o serviço de pagamento. Tente novamente.' }, 502, cors);
  }

  const upstreamBody: any = await upstream.json().catch(() => ({}));

  if (upstream.status === 201) {
    const subStatus = statusFromUvviPay(String(upstreamBody.subscription_status ?? 'PENDING')) ?? 'incomplete';
    const subId = String(upstreamBody.subscription_id);
    const custId = String(upstreamBody.customer_id ?? existing?.uvvipay_customer_id ?? '');

    await admin.from('subscriptions').upsert({
      user_id: userId,
      payment_provider: 'uvvipay',
      uvvipay_customer_id: custId || null,
      uvvipay_subscription_id: subId,
      uvvipay_plan_id: planId,
      plano: plan,
      status: subStatus,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    await admin.from('uvvipay_creation_requests')
      .update({ subscription_id: subId })
      .eq('user_id', userId).eq('idempotency_key', body.client_request_id);

    // QR Code devolvido ao front. A liberação do acesso só ocorre pelo webhook.
    return json({
      subscription_id: subId,
      status: subStatus,
      pix: upstreamBody.pix ? { qrcode: upstreamBody.pix.qrcode ?? null, qrcode_image: upstreamBody.pix.qrcode_image ?? null } : null,
    }, 201, cors);
  }

  // Erro: libera a chave para nova tentativa e devolve mensagem genérica
  await admin.from('uvvipay_creation_requests').delete().eq('user_id', userId).eq('idempotency_key', body.client_request_id);
  logError('upstream_status', { status: upstream.status, code: upstreamBody.code ?? null, method });

  if (upstreamBody.code === 'UVV154158') return json({ error: 'Você já possui uma assinatura neste plano.' }, 409, cors);
  if (upstreamBody.code === 'UVV154361') return json({ error: 'Endereço incompleto para Pix Automático.' }, 422, cors);
  if (upstream.status === 429) return json({ error: 'Serviço ocupado. Tente novamente em instantes.' }, 503, cors);
  if (upstream.status >= 500) return json({ error: 'Serviço de pagamento indisponível. Tente novamente.' }, 502, cors);
  return json({ error: 'Não foi possível criar a assinatura. Verifique os dados.' }, 422, cors);
});
