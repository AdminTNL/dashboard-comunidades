import { getProjeto } from '../_lib/config.js';
import { signSession, newSessionPayload, buildSessionCookie } from '../_lib/auth.js';
import { jsonResponse, errorResponse } from '../_lib/response.js';

export async function onRequestPost({ request, env }) {
  if (!env.AUTH_SECRET) {
    return errorResponse('AUTH_SECRET nao configurado no ambiente.', 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corpo da requisicao invalido.', 400);
  }

  const chave = String(body.projeto || '').toLowerCase().trim();
  const senha = String(body.senha || '');

  let projAutenticado = null;

  if (env.PASS_ADMIN && senha === env.PASS_ADMIN) {
    projAutenticado = 'admin';
  } else {
    const projeto = getProjeto(chave);
    const envKey = `PASS_${chave.toUpperCase()}`;
    if (projeto && env[envKey] && senha === env[envKey]) {
      projAutenticado = chave;
    }
  }

  if (!projAutenticado) {
    return errorResponse('Senha incorreta.', 401);
  }

  const token = await signSession(newSessionPayload(projAutenticado), env.AUTH_SECRET);
  return jsonResponse(
    { ok: true, proj: projAutenticado },
    { headers: { 'Set-Cookie': buildSessionCookie(token) } }
  );
}
