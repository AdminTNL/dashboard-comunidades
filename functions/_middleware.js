import { readSessionCookie, verifySession, verifyEmbedLaunch, readBearerToken } from './_lib/auth.js';

// O Cloudflare Pages redireciona /login.html -> /login (URLs limpas), entao
// as excecoes e os redirects abaixo usam sempre a forma sem extensao.
const PUBLIC_PATHS = new Set(['/login', '/login.html', '/api/login', '/api/logout', '/api/embed-exchange', '/config/projetos.json']);

// Estaticos sem dado sensivel: precisam carregar dentro do iframe do Painel,
// onde nao ha cookie de sessao (o embed autentica por token em header).
const PUBLIC_PREFIXES = ['/img/', '/css/', '/js/'];

// Origens que podem embutir este dashboard em iframe (CSP frame-ancestors).
// EMBED_ALLOWED_ORIGINS (lista separada por espaco) sobrescreve o padrao.
const DEFAULT_EMBED_ORIGINS = 'https://painel-mobilizacao.netlify.app';

function isApiPath(pathname) {
  return pathname.startsWith('/api/');
}

function redirectTo(url, request) {
  return Response.redirect(new URL(url, request.url), 302);
}

// Anexa o frame-ancestors em toda resposta, restringindo quem pode embutir o dashboard.
function comFrameAncestors(response, env) {
  const origens = (env.EMBED_ALLOWED_ORIGINS || DEFAULT_EMBED_ORIGINS).trim();
  const final = new Response(response.body, response);
  final.headers.set('Content-Security-Policy', `frame-ancestors 'self' ${origens}`);
  return final;
}

export async function onRequest(context) {
  return comFrameAncestors(await autenticar(context), context.env);
}

async function autenticar({ request, env, next }) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  // Login, favicon/logos e assets estaticos precisam estar acessiveis sem sessao
  if (PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return next();
  }

  if (!env.AUTH_SECRET) {
    return new Response('AUTH_SECRET nao configurado no ambiente.', { status: 500 });
  }

  // Sessao por cookie (acesso direto) ou por Bearer (embed no Painel de Mobilizacao)
  const token = readSessionCookie(request) || readBearerToken(request);
  let session = token ? await verifySession(token, env.AUTH_SECRET) : null;

  // Primeira carga da pagina dentro do embed: ainda nao ha sessao, so o launch token na URL.
  // O escopo continua valendo: abaixo o projeto da URL precisa bater com o do token.
  const ehPaginaPrincipal = pathname === '/' || pathname === '/index.html';
  if (!session && ehPaginaPrincipal && searchParams.get('embed_token')) {
    const launch = await verifyEmbedLaunch(searchParams.get('embed_token'), env);
    if (launch) session = { proj: launch.proj };
  }

  // --- Chamadas de API: exige sessao valida e escopo de projeto correto ---
  if (isApiPath(pathname)) {
    if (!session) {
      return new Response(JSON.stringify({ error: 'Sessao invalida ou expirada.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    // Convencao: todo endpoint de dados fica em /api/<chave-do-projeto>/... ,
    // seja via rota dinamica [projeto] ou uma pasta fixa (ex.: /api/pa/usinas).
    const alvo = pathname.split('/')[2];
    if (session.proj !== 'admin' && session.proj !== alvo) {
      return new Response(JSON.stringify({ error: 'Sem acesso a este projeto.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    return next();
  }

  // --- Paginas: sem sessao valida, manda pro login (preservando destino e projeto) ---
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    if (searchParams.get('projeto')) loginUrl.searchParams.set('projeto', searchParams.get('projeto'));
    loginUrl.searchParams.set('next', pathname + url.search);
    return Response.redirect(loginUrl, 302);
  }

  // --- /admin so para o token de admin ---
  if (pathname === '/admin' || pathname === '/admin.html') {
    if (session.proj !== 'admin') {
      return redirectTo(`/?projeto=${session.proj}`, request);
    }
    return next();
  }

  // --- Pagina principal: usuario de projeto especifico so ve o proprio projeto ---
  if (pathname === '/' || pathname === '/index.html') {
    if (session.proj === 'admin') {
      // Admin sem projeto escolhido cai na pagina de selecao
      if (!searchParams.get('projeto')) {
        return redirectTo('/admin', request);
      }
      return next();
    }
    const projetoPedido = searchParams.get('projeto');
    if (projetoPedido !== session.proj) {
      return redirectTo(`/?projeto=${session.proj}`, request);
    }
    return next();
  }

  // --- Assets estaticos (css/js/config): qualquer sessao valida pode ler ---
  return next();
}
