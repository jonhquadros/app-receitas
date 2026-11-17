import { logError } from './http.ts';
import { uvvipayGet } from './uvvipay-api.ts';

// Eventos de transação que tratamos como renovação. Os demais transaction.* são só registrados.
const RENEWAL_EVENTS = new Set(['transaction.waiting_payment', 'transaction.expired', 'transaction.paid']);
export const isRenewalTransactionEvent = (event: string) => RENEWAL_EVENTS.has(event);

// externalReference no formato "charge-<id da fatura>-<tentativa>"
const REFERENCE_RE = /^charge-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(\d+)$/i;

export function parseExternalReference(ref: unknown): { invoiceId: string; attempt: number } | null {
  const m = REFERENCE_RE.exec(String(ref ?? ''));
  return m ? { invoiceId: m[1].toLowerCase(), attempt: Number(m[2]) } : null;
}

/**
 * Trata um evento transaction.* de renovação.
 * Retorna true quando o evento foi tratado (ou não é de renovação).
 * Retorna false para pedir reenvio à UvviPay (falha temporária).
 */
export async function handleRenewalTransaction(admin: any, evt: any, eventType: string): Promise<boolean> {
  const txId = evt?.id ? String(evt.id) : '';
  if (!txId) { logError('renewal_no_tx_id', { event: eventType }); return true; }

  const ref = parseExternalReference(evt?.externalReference);
  if (!ref) return true; // transação que não é de renovação de fatura

  // 1. Fatura -> assinatura. O webhook não traz subscription_id.
  const inv = await uvvipayGet(`/v1/subscriptions/invoices/${ref.invoiceId}`);
  const subscriptionId = inv.ok && inv.body?.subscription_id ? String(inv.body.subscription_id) : null;
  if (!subscriptionId) { logError('renewal_invoice_lookup', { status: inv.status, event: eventType }); return false; }

  // 2. Assinatura -> usuário
  const { data: sub, error: subErr } = await admin.from('subscriptions')
    .select('user_id').eq('uvvipay_subscription_id', subscriptionId).maybeSingle();
  if (subErr) { logError('renewal_sub_lookup', { code: subErr.code }); return false; }
  if (!sub) { logError('renewal_unknown_subscription', { event: eventType }); return true; }

  const base = {
    transaction_id: txId,
    user_id: sub.user_id,
    subscription_id: subscriptionId,
    invoice_id: ref.invoiceId,
    attempt: ref.attempt,
    amount_cents: typeof evt.amount === 'number' ? evt.amount : null,
    updated_at: new Date().toISOString(),
  };

  if (eventType === 'transaction.waiting_payment') {
    // O código Pix só vem neste evento. Nos seguintes, pix chega nulo.
    const pixCode = evt?.pix?.qrCode ?? evt?.pix?.qrcode ?? null;
    if (!pixCode) { logError('renewal_no_pix_code', { event: eventType }); return false; }

    // A validade não vem no webhook. Está em GET /v1/payments/{id}, campo pix.expiresAt.
    const pay = await uvvipayGet(`/v1/payments/${txId}`);
    if (!pay.ok) { logError('renewal_payment_lookup', { status: pay.status }); return false; }
    const expiresAt = pay.body?.pix?.expiresAt ?? null;
    if (!expiresAt) logError('renewal_no_expires_at', { event: eventType });

    const { error } = await admin.from('renewal_charges').upsert(
      { ...base, pix_code: pixCode, pix_expires_at: expiresAt, status: 'waiting_payment' },
      { onConflict: 'transaction_id' },
    );
    if (error) { logError('renewal_upsert', { code: error.code }); return false; }
    return true;
  }

  // expired / paid: só muda o status. Não envia pix_code, para não apagar o código já guardado.
  const status = eventType === 'transaction.expired' ? 'expired' : 'paid';
  const { error } = await admin.from('renewal_charges').upsert(
    { ...base, status },
    { onConflict: 'transaction_id' },
  );
  if (error) { logError('renewal_status_upsert', { code: error.code, status }); return false; }
  return true;
}

// Estorno e chargeback: o cliente perdeu o direito ao pagamento, então o acesso é revogado.
const REVOCATION_EVENTS = new Set(['transaction.chargedback', 'transaction.refunded']);
export const isRevocationTransactionEvent = (event: string) => REVOCATION_EVENTS.has(event);

/**
 * Revoga o acesso da assinatura ligada à transação estornada ou contestada.
 * Só consegue associar quando a transação tem externalReference de renovação ("charge-...").
 * Transações sem essa referência são registradas no log e não alteram nada.
 * Retorna false para pedir reenvio à UvviPay (falha temporária).
 */
export async function handleRevocation(admin: any, evt: any, eventType: string): Promise<boolean> {
  const ref = parseExternalReference(evt?.externalReference);
  if (!ref) {
    logError('revocation_unmapped', { event: eventType, hasReference: Boolean(evt?.externalReference) });
    return true;
  }

  const inv = await uvvipayGet(`/v1/subscriptions/invoices/${ref.invoiceId}`);
  const subscriptionId = inv.ok && inv.body?.subscription_id ? String(inv.body.subscription_id) : null;
  if (!subscriptionId) { logError('revocation_invoice_lookup', { status: inv.status, event: eventType }); return false; }

  const { data, error } = await admin.from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('uvvipay_subscription_id', subscriptionId)
    .select('user_id');
  if (error) { logError('revocation_update', { code: error.code }); return false; }

  if (!data || data.length === 0) { logError('revocation_unknown_subscription', { event: eventType }); return true; }
  logError('revocation_applied', { event: eventType });
  return true;
}
