// Verificação do webhook da UvviPay (HMAC-SHA256).
// Assinatura = HMAC-SHA256(secret, `${timestamp}.${rawBody}`), enviada como
// "sha256=<hex>" no header X-UvviPay-Signature, com timestamp em X-UvviPay-Timestamp.
// Rejeita timestamps fora da janela de tolerância (padrão 300 s) e compara em tempo constante.

export const UVVIPAY_TOLERANCE_SECONDS = 300;

const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyUvviPaySignature(params: {
  rawBody: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
  secret: string;
  nowSeconds: number;
  toleranceSeconds?: number;
}): Promise<boolean> {
  const { rawBody, signatureHeader, timestampHeader, secret, nowSeconds } = params;
  const tolerance = params.toleranceSeconds ?? UVVIPAY_TOLERANCE_SECONDS;

  if (!secret || !signatureHeader || !timestampHeader) return false;

  const timestamp = Number(timestampHeader);
  if (!Number.isInteger(timestamp)) return false;
  if (Math.abs(nowSeconds - timestamp) > tolerance) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`));
  const expected = `sha256=${toHex(mac)}`;

  return constantTimeEqual(expected, signatureHeader.trim());
}
