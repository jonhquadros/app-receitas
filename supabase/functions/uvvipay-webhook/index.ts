import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { verifyUvviPaySignature } from '../_shared/uvvipay-signature.ts';
import { json, logError } from '../_shared/http.ts';
import { isSubscriptionEvent, statusFromEvent } from '../_shared/status.ts';
import {
  handleRenewalTransaction,
  handleRevocation,
  isRenewalTransactionEvent,
  isRevocationTransactionEvent,
} from '../_shared/renewal.ts';

// Tempo após o qual um evento sem marca de conclusão é considerado interrompido e pode ser retomado.
const STALE_MS = 120_000;

const sha256Hex = async (text: string) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

type Claim = 'claimed' | 'duplicate' | 'busy' | 'error';

// Reserva o evento para processamento.
// - Já concluído: duplicate (responde 200, a UvviPay para de reenviar).
// - Em andamento há pouco: busy (responde 409, a UvviPay tenta de novo depois).
// - Interrompido há mais de STALE_MS sem conclusão: é retomado.
async function claimEvent(admin: any, eventId: string, eventType: string, subId: string | null): Promise<Claim> {
  const { error } = await admin.from('uvvipay_webhook_events').insert({
    event_id: eventId, event_type: eventType, subscription_id: subId,
  });
  if (!error) return 'claimed';
  if (error.code !== '23505') { logError('webhook_dedupe', { code: error.code }); return 'error'; }

  const { data: row, error: selErr } = await admin.from('uvvipay_webhook_events')
    .select('processed_at, received_at').eq('event_id', eventId).maybeSingle();
  if (selErr || !row) { logError('webhook_dedupe_read', { code: selErr?.code }); return 'error'; }
  if (row.processed_at) return 'duplicate';

  const age = Date.now() - new Date(row.received_at).getTime();
  if (age < STALE_MS) return 'busy';

  // Retomada: só uma requisição consegue assumir o evento parado (condição na própria query).
  const staleCutoff = new Date(Date.now() - STALE_MS).toISOString();
  const { data: taken, error: takeErr } = await admin.from('uvvipay_webhook_events')
    .update({ received_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .is('processed_at', null)
    .lt('received_at', staleCutoff)
    .select('event_id');
  if (takeErr) { logError('webhook_takeover', { code: takeErr.code }); return 'error'; }
  return taken && taken.length > 0 ? 'claimed' : 'busy';
}

// Sem JWT: a UvviPay não envia token. A autenticidade vem da assinatura HMAC.
Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405);

  const rawBody = await req.text();
  const secret = Deno.env.get('UVVIPAY_WEBHOOK_SECRET') ?? '';

  const valid = await verifyUvviPaySignature({
    rawBody,
    signatureHeader: req.headers.get('X-UvviPay-Signature'),
    timestampHeader: req.headers.get('X-UvviPay-Timestamp'),
    secret,
    nowSeconds: Math.floor(Date.now() / 1000),
  });
  if (!valid) { logError('webhook_signature', { ok: false }); return json({ error: 'Assinatura inválida' }, 401); }

  let evt: any;
  try { evt = JSON.parse(rawBody); } catch { return json({ error: 'JSON inválido' }, 400); }
  const eventType = String(evt?.event ?? '');
  if (!eventType) return json({ error: 'Evento incompleto' }, 400);

  const isSub = isSubscriptionEvent(eventType);
  const isRenewalTx = isRenewalTransactionEvent(eventType);
  const isRevocation = isRevocationTransactionEvent(eventType);

  // Eventos que este código não usa (transaction.status.updated, disputas, submerchants, etc.)
  // são aceitos sem gravar nada, para não acumular linhas na tabela.
  if (!isSub && !isRenewalTx && !isRevocation) return json({ received: true, ignored: true }, 200);

  // Chave de deduplicação: event_id quando existir; senão, hash do corpo.
  const eventId = evt?.event_id ? String(evt.event_id) : `body:${await sha256Hex(rawBody)}`;
  const subId = isSub && evt?.id ? String(evt.id) : null;

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const claim = await claimEvent(admin, eventId, eventType, subId);
  if (claim === 'duplicate') return json({ received: true, duplicate: true }, 200);
  if (claim === 'busy') return json({ error: 'Em processamento' }, 409);
  if (claim === 'error') return json({ error: 'Falha temporária' }, 500);

  // Em caso de falha, remove a marca para que a UvviPay reenvie
  const failTemporarily = async () => {
    await admin.from('uvvipay_webhook_events').delete().eq('event_id', eventId);
    return json({ error: 'Falha temporária' }, 500);
  };

  // Marca como concluído. Só depois disso o evento deixa de ser retomado.
  const markProcessed = async () => {
    const { error } = await admin.from('uvvipay_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('event_id', eventId);
    if (error) logError('webhook_mark_processed', { code: error.code });
  };

  // Renovação Pix: transaction.waiting_payment (guarda o código), expired e paid
  if (isRenewalTx) {
    const ok = await handleRenewalTransaction(admin, evt, eventType);
    if (!ok) return failTemporarily();
    await markProcessed();
    return json({ received: true }, 200);
  }

  // Estorno e chargeback: revoga o acesso
  if (isRevocation) {
    const ok = await handleRevocation(admin, evt, eventType);
    if (!ok) return failTemporarily();
    await markProcessed();
    return json({ received: true }, 200);
  }

  // Eventos de assinatura
  const newStatus = subId ? statusFromEvent(eventType) : null;
  if (!newStatus) { await markProcessed(); return json({ received: true, ignored: true }, 200); }

  // A data de validade só é gravada quando o pagamento foi confirmado.
  // Em eventos sem pagamento (criação, pendente, cancelamento), mantém a data anterior.
  const CONFIRMS_PAYMENT = ['subscription.activated', 'subscription.renewed', 'subscription.reactivated'];
  const update: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (CONFIRMS_PAYMENT.includes(eventType)) {
    const periodEnd = evt.period_end_date ?? evt.next_billing_date ?? null;
    update.periodo_atual_fim = periodEnd;
    update.current_period_end = periodEnd;
  }

  const { data: updated, error: updErr } = await admin.from('subscriptions')
    .update(update)
    .eq('uvvipay_subscription_id', subId)
    .select('user_id');

  if (updErr) {
    logError('webhook_update', { code: updErr.code });
    return failTemporarily();
  }
  if (!updated || updated.length === 0) logError('webhook_unknown_subscription', { event: eventType });

  await markProcessed();
  return json({ received: true }, 200);
});
