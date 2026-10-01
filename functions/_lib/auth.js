const SESSION_COOKIE = 'session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function base64UrlEncode(bytes) {
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - (str.length % 4)) % 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Token = base64url(payloadJson) + "." + base64url(assinatura HMAC-SHA256)
export async function signSession(payload, secret) {
  const key = await getHmacKey(secret);
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadPart = base64UrlEncode(payloadBytes);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadPart));
  const signaturePart = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${payloadPart}.${signaturePart}`;
}

export async function verifySession(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return null;

  const key = await getHmacKey(secret);
  const expectedSignature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadPart));
  const expectedSignaturePart = base64UrlEncode(new Uint8Array(expectedSignature));
  if (expectedSignaturePart !== signaturePart) return null;

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart)));
  } catch {
    return null;
  }

  if (!payload.exp || Date.now() / 1000 > payload.exp) return null;
  return payload;
}

export function buildSessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}`;
}

export function buildLogoutCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function readSessionCookie(request) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export function newSessionPayload(proj) {
  return { proj, exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS };
}

// --- Embed no Painel de Mobilizacao (iframe cross-site) ---
// Cookie SameSite=Strict nao e enviado em iframe de outro dominio (e o Safari
// bloqueia cookie de terceiros), entao o embed usa token no header Authorization.
// O Painel gera um "launch token" curto, assinado com EMBED_SECRET (segredo
// compartilhado), que e trocado aqui por um token de sessao assinado com AUTH_SECRET.
export const EMBED_SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas

// Valida o launch token do Painel. Nunca aceita 'admin': o embed e sempre de um projeto.
export async function verifyEmbedLaunch(token, env) {
  if (!env.EMBED_SECRET) return null;
  const payload = await verifySession(token, env.EMBED_SECRET);
  if (!payload || payload.aud !== 'embed-launch') return null;
  if (typeof payload.proj !== 'string' || !payload.proj || payload.proj === 'admin') return null;
  return payload;
}

export function embedSessionPayload(proj) {
  return { proj, via: 'embed', exp: Math.floor(Date.now() / 1000) + EMBED_SESSION_DURATION_SECONDS };
}

export function readBearerToken(request) {
  const match = (request.headers.get('Authorization') || '').match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}

export { SESSION_DURATION_SECONDS };
