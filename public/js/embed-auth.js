// =========================================================================
// AUTENTICACAO DO EMBED (Painel de Mobilizacao)
// Dentro de iframe de outro dominio o cookie de sessao nao funciona (SameSite
// e bloqueio de cookie de terceiros no Safari). Quando a URL traz ?embed_token=,
// trocamos esse token curto por um token de sessao, guardado so em memoria, e o
// anexamos no header Authorization de toda chamada /api. Sem o parametro, nada muda.
// =========================================================================
(() => {
  const params = new URLSearchParams(window.location.search);
  const launchToken = params.get('embed_token');
  if (!launchToken) return;

  let sessionToken = null;

  // Remove o token da barra de enderecos/historico
  params.delete('embed_token');
  const query = params.toString();
  window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash);

  const originalFetch = window.fetch.bind(window);

  window.__embedReady = originalFetch('/api/embed-exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ launch_token: launchToken })
  })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error('embed-exchange ' + res.status))))
    .then((data) => { sessionToken = data.token; })
    .catch((err) => {
      console.error('Falha ao autenticar o embed:', err);
      window.location.href = '/login' + (params.get('projeto') ? `?projeto=${encodeURIComponent(params.get('projeto'))}` : '');
    });

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === 'string' ? input : input.url;
    const target = new URL(rawUrl, window.location.href);
    const ehApiDoProjeto = target.origin === window.location.origin && target.pathname.startsWith('/api/')
      && !['/api/login', '/api/logout', '/api/embed-exchange'].includes(target.pathname);
    if (!ehApiDoProjeto) return originalFetch(input, init);

    await window.__embedReady;
    const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
    if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`);
    return originalFetch(input, { ...init, headers });
  };

  // Sair nao faz sentido no embed: quem controla o acesso e o Painel
  window.addEventListener('DOMContentLoaded', () => {
    const logout = document.getElementById('logout-btn');
    if (logout) logout.classList.add('hidden');
  });
})();
