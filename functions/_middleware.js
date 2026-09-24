import { readSessionCookie, verifySession } from './_lib/auth.js';

// O Cloudflare Pages redireciona /login.html -> /login (URLs limpas), entao
// as excecoes e os redirects abaixo usam sempre a forma sem extensao.
const PUBLIC_PATHS = new Set(['/login', '/login.html', '/api/login', '/api/logout', '/config/projetos.json']);

function isApiPath(pathname) {
  return pathname.startsWith('/api/');
}

function redirectTo(url, request) {
  return Response.redirect(new URL(url, request.url), 302);
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  if (PUBLIC_PATHS.has(pathname)) {
    return next();
  }

  if (!env.AUTH_SECRET) {
    return new Response('AUTH_SECRET nao configurado no ambiente.', { status: 500 });
  }

  const token = readSessionCookie(request);
  const session = token ? await verifySession(token, env.AUTH_SECRET) : null;

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
