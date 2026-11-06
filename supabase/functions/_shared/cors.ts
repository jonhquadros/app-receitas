// CORS restrito: só origens explicitamente permitidas recebem Access-Control-Allow-Origin.
// Lista em APP_ALLOWED_ORIGINS (separada por vírgula). Sem fallback para '*'.

const DEFAULT_ALLOWED = [
  'https://app-receitas-kappa.vercel.app',
  'http://localhost:5173',
];

export function allowedOrigins(envValue: string | undefined): string[] {
  const fromEnv = (envValue ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED;
}

export function corsHeadersFor(requestOrigin: string | null, allowed: string[]): Record<string, string> {
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (requestOrigin && allowed.includes(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
  }
  return headers;
}
