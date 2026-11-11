import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { verifyUvviPaySignature } from '../_shared/uvvipay-signature.ts';
import { json, logError } from '../_shared/http.ts';
import { isSubscriptionEvent, statusFromEvent } from '../_shared/status.ts';

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
  const eventId = String(evt?.event_id ?? '');
  const eventType = String(evt?.event ?? '');
  const subId = evt?.id ? String(evt.id) : null;
  if (!eventId || !eventType) return json({ error: 'Evento incompleto' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Deduplicação: o mesmo event_id é processado uma única vez
  const { error: insErr } = await admin.from('uvvipay_webhook_events').insert({
    event_id: eventId, event_type: eventType, subscription_id: subId,
  });
  if (insErr) {
    if (insErr.code === '23505') return json({ received: true, duplicate: true }, 200);
    logError('webhook_dedupe', { code: insErr.code });
    return json({ error: 'Falha temporária' }, 500); // UvviPay tenta de novo
  }

  // Só eventos de assinatura alteram status. transaction.* fica apenas registrado.
  if (!isSubscriptionEvent(eventType) || !subId) return json({ received: true }, 200);

  const newStatus = statusFromEvent(eventType);
  if (!newStatus) return json({ received: true, ignored: true }, 200);

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
    // Remove a marca para que a UvviPay reenvie e a atualização não se perca
    await admin.from('uvvipay_webhook_events').delete().eq('event_id', eventId);
    return json({ error: 'Falha temporária' }, 500);
  }
  if (!updated || updated.length === 0) logError('webhook_unknown_subscription', { event: eventType });

  return json({ received: true }, 200);
});
