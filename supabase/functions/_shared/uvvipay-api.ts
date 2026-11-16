import { UPSTREAM_TIMEOUT_MS, UVVIPAY_BASE } from './http.ts';

// GET autenticado na UvviPay. Só roda no backend. Usa os mesmos headers da criação de assinatura.
export async function uvvipayGet(path: string): Promise<{ ok: boolean; status: number; body: any }> {
  try {
    const res = await fetch(`${UVVIPAY_BASE}${path}`, {
      method: 'GET',
      headers: {
        'client-id': Deno.env.get('UVVIPAY_CLIENT_ID') ?? '',
        'client-secret': Deno.env.get('UVVIPAY_CLIENT_SECRET') ?? '',
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: {} };
  }
}
