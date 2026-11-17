import { UVVIPAY_BASE } from './http.ts';

// Timeout das chamadas feitas pelo webhook. A UvviPay desiste da entrega em 30 s.
// Como o webhook pode fazer até duas chamadas, 8 s cada deixa folga com segurança.
export const WEBHOOK_UPSTREAM_TIMEOUT_MS = 8_000;

// GET autenticado na UvviPay. Só roda no backend. Usa os mesmos headers da criação de assinatura.
export async function uvvipayGet(
  path: string,
  timeoutMs = WEBHOOK_UPSTREAM_TIMEOUT_MS,
): Promise<{ ok: boolean; status: number; body: any }> {
  try {
    const res = await fetch(`${UVVIPAY_BASE}${path}`, {
      method: 'GET',
      headers: {
        'client-id': Deno.env.get('UVVIPAY_CLIENT_ID') ?? '',
        'client-secret': Deno.env.get('UVVIPAY_CLIENT_SECRET') ?? '',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: {} };
  }
}
