import { getProjeto } from '../_lib/config.js';
import { signSession, embedSessionPayload, verifyEmbedLaunch } from '../_lib/auth.js';
import { jsonResponse, errorResponse } from '../_lib/response.js';

// Troca o launch token (curto, vindo do Painel de Mobilizacao) por um token de
// sessao do projeto, que o front envia no header Authorization nas chamadas /api.
export async function onRequestPost({ request, env }) {
  if (!env.AUTH_SECRET || !env.EMBED_SECRET) {
    return errorResponse('Embed nao configurado no ambiente.', 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corpo da requisicao invalido.', 400);
  }

  const launch = await verifyEmbedLaunch(String(body.launch_token || ''), env);
  if (!launch || !getProjeto(launch.proj)) {
    return errorResponse('Token de embed invalido ou expirado.', 401);
  }

  const token = await signSession(embedSessionPayload(launch.proj), env.AUTH_SECRET);
  return jsonResponse({ ok: true, proj: launch.proj, token });
}
