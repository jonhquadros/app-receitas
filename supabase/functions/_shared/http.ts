export const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

export const UVVIPAY_BASE = 'https://api.uvvipay.com.br';
export const UPSTREAM_TIMEOUT_MS = 20_000;

// Log sem dados pessoais e sem credenciais: só código e status.
export const logError = (where: string, detail: Record<string, unknown>) =>
  console.error(JSON.stringify({ where, ...detail }));
