# CLAUDE.md — Dashboard Comunidades

Este arquivo existe pra qualquer pessoa (ou agente Claude Code) que entrar
nesse repositório depois de mim entender rápido o que é o projeto, como ele
funciona hoje, o histórico de como chegou nesse estado, e o que fazer pra
continuar mexendo nele sem quebrar nada. Leia isso inteiro antes de propor
qualquer mudança estrutural.

## O que é este projeto

Um dashboard interno (não é produto público) que mostra métricas de
engajamento, movimentação de base e outras coisas específicas, pra vários
projetos/campanhas diferentes (Pernambuco, Pará, Mato Grosso do Sul, Escalada,
Escala 6x1, Lara Santana — cada um é uma campanha/projeto separado da mesma
organização). Cada projeto tem seu próprio link com senha; existe também um
login de admin que acessa todos.

**Produção**: https://comunidades.centraldeengajamento.com.br (também responde em
`dashboard-comunidades.pages.dev`), hospedado no **Cloudflare Pages**, projeto
`dashboard-comunidades`. Repositório GitHub: `AdminTNL/dashboard-comunidades`,
branch `main` conectada por Git integration (ver "Pegadinhas" se o deploy
automático parar de rodar).

## Como chegou até aqui (contexto que explica decisões abaixo)

Originalmente cada projeto tinha seu próprio arquivo HTML standalone
(`escalada.html`, `para.html`, `pernambuco.html`, `ms.html`) — cada alteração
de funcionalidade compartilhada precisava ser feita em N arquivos. Isso foi
unificado num `oficial.html` só, com um dicionário `CONFIG_PROJETOS` decidindo
quais abas cada projeto via. O backend era o n8n (self-hosted em
`webhookn8n.tnledu.shop`) fazendo de intermediário pro Supabase (self-hosted em
`database.tnledu.shop`).

Depois disso veio uma reescrita em 5 fases (a numeração aparece nas mensagens
de commit, é útil pra entender a ordem histórica via `git log`):

1. **Modularização do front-end**: `oficial.html` foi quebrado em
   `public/index.html` + módulos `.js` por aba + `public/config/projetos.json`
   como manifesto, substituindo o dicionário embutido no HTML.
2. **Cloudflare Functions direto no Supabase**: eliminado o n8n como
   intermediário pra leitura do dashboard. As Functions em `functions/api/`
   chamam as mesmas RPCs do Supabase que o n8n chamava, só que direto, com a
   service role key.
3. **Primeira feature real usando o registro de features** (ver
   `PADRAO-EXTENSAO-ABA-COMPARTILHADA.md`): cruzamento de votantes das
   enquetes com uma base de comissionados, exclusivo do projeto Pará, dentro
   da aba compartilhada de Engajamento.
4. **Autenticação**: sessão por cookie assinado, senha por projeto + admin.
5. **Deploy**: Cloudflare Pages conectado ao GitHub, domínio próprio.

Os arquivos HTML standalone originais e o `oficial.html` unificado (pré-fases)
foram movidos pra `legado/` — servem só de referência histórica, **não editar,
não usar como fonte de verdade**. O GitHub Pages que os publicava foi
desativado de propósito (era usado por parte do time; a ideia é que, ao ver
que parou de funcionar, procurem o link novo).

## Arquitetura atual

```
Navegador
  │
  ├─ GET /, /login, /admin, /css/*, /js/*, /config/*, /img/*
  │     → Cloudflare Pages serve public/ (passando por functions/_middleware.js)
  │
  └─ GET /api/<projeto>/<recurso>  (mesma origem, sem CORS)
        → Cloudflare Pages Function (functions/api/...)
              → Supabase (service role key) via RPC
```

Não existe mais build step: `public/` é servido como está (HTML/CSS/JS puro,
sem bundler/framework), e `functions/` é código de Cloudflare Pages Functions
(runtime Workers, roteamento por nome de arquivo).

### Estrutura de pastas

```
public/                       # tudo que é servido como estático
├── index.html                 # shell do dashboard (header, sidebar, as 5 abas)
├── login.html                 # tela de login (autossuficiente, sem depender de css/js compartilhado)
├── admin.html                 # lista de projetos, só acessível como admin
├── config/projetos.json       # manifesto: projeto → nome, dbProjeto, slug, tabs, features
├── css/app.css
├── img/                       # favicon + logo
└── js/
    ├── app.js                  # boot (lê o manifesto), utils compartilhados, registro de features
    ├── tabs/                   # um módulo por aba (comunidades, movimentacao, presenca, usinas, novo-usinas)
    └── features/               # features exclusivas de projeto dentro de aba compartilhada (ver PADRAO-EXTENSAO)

functions/
├── _middleware.js              # roda antes de TUDO: exige sessão, isola projeto por projeto
├── _lib/
│   ├── auth.js                  # assina/verifica o cookie de sessão (HMAC, Web Crypto nativo)
│   ├── config.js                 # lê public/config/projetos.json, resolve dbProjeto
│   ├── supabase.js                # cria o client do Supabase (service role)
│   └── response.js                 # helpers de resposta JSON
└── api/
    ├── login.js / logout.js
    ├── [projeto]/engajamento.js e movimentacao.js   # rota dinâmica, funciona pra qualquer projeto do manifesto
    └── pa/usinas.js, novo-usinas.js, voto-ranking.js # exclusivos do Pará

legado/                         # HTML pré-unificação, só histórico, não usar
PADRAO-EXTENSAO-ABA-COMPARTILHADA.md   # como adicionar feature exclusiva dentro de aba compartilhada
wrangler.toml, package.json     # config do Cloudflare + dependência @supabase/supabase-js
.dev.vars.example               # template das variáveis de ambiente locais (.dev.vars é gitignored)
```

## Projetos e abas (public/config/projetos.json)

| Chave | Nome de exibição | `dbProjeto` (usado nas RPCs) | Abas |
|---|---|---|---|
| `pe` | Pernambuco | Pernambuco | comunidades, movimentacao, **presenca** |
| `pa` | Pará | Pará | comunidades, movimentacao, **usinas**, **novo-usinas** |
| `ms` | Mato Grosso do Sul | Mato Grosso do Sul | comunidades, movimentacao |
| `escalada` | Escalada | Escalada | comunidades, movimentacao |
| `escala6x1` | Brasil Quer Mais Tempo | **Escala 6x1** ⚠️ | comunidades, movimentacao |
| `lara` | Lara Santana | Lara Santana | comunidades, movimentacao |

`comunidades` (Engajamento) e `movimentacao` (Movimentação da Base) são
compartilhadas por todos. `presenca`, `usinas` e `novo-usinas` são abas
inteiras exclusivas de um projeto (controladas por `tabs` no manifesto). O
Pará também tem uma **feature** (não uma aba) exclusiva dentro de
`comunidades`: `voto-ranking-pa` (cruzamento de votantes x comissionados) —
ver `PADRAO-EXTENSAO-ABA-COMPARTILHADA.md` pra entender/estender esse
mecanismo.

⚠️ **`dbProjeto` pode ser diferente do nome de exibição** — é o valor exato
esperado pelo parâmetro `p_projeto` das RPCs do Supabase. `escala6x1` é o
único caso divergente hoje (nome de exibição bonito, mas o banco conhece o
projeto como "Escala 6x1"). Adicionar projeto novo: sempre confirme o valor
exato de `projetos.nome` no banco antes de assumir que bate com o nome de
exibição.

## Funções/tabelas do Supabase usadas hoje

Todas chamadas via `service_role` a partir das Cloudflare Functions (RLS
bypassado de propósito — a autenticação é feita na camada do dashboard, não
no banco).

- `get_dashboard_data(p_projeto text)` — mensagens + reações/votos + `tipo`
  (`'enquete'` ou `'mensagem simples'`) de um projeto. Usada pela aba
  Engajamento.
- `get_movimentacao_detalhada(p_projeto text)` — histórico diário de
  entradas/saídas, logs brutos, info de comunidades. Usada pela aba
  Movimentação.
- `get_dashboard_usinas()` — sem parâmetro, olha a tabela `leads`. Usada pela
  aba Usinas (Pará).
- `get_usinas_saldo_diario(p_campanha_id integer)` — **`p_campanha_id` é
  fixo em `23`** (hardcoded em `functions/api/pa/novo-usinas.js`, veio de um
  node do n8n antigo que também tinha esse valor fixo). Usada pela aba Novo
  Placar (Pará).
- `get_pa_voto_ranking(p_start date, p_end date)` — cruza `interacoes_v2`
  (votos, filtrado por `mensagens.tipo = 'enquete'` e `data_envio` no
  período) com a tabela `pa_comissionados` via `normalize_telefone_br`.
  Exclusiva da feature `voto-ranking-pa`.
- `normalize_telefone_br(text)` — função utilitária pré-existente do banco,
  usada pra casar telefones em formatos diferentes.
- Tabela `pa_comissionados` — importada manualmente via CSV (Table Editor do
  Supabase), colunas: `nome`, `instagram`, `outros_perfis`, `whatsapp`,
  `secretaria`, `numero_formatado`, `comunidade`.

A aba **Encontros** (`presenca`, exclusiva PE) **não usa Supabase nem
Cloudflare Functions** — chama direto uma URL de Google Apps Script (ver
`public/js/tabs/presenca.js`). É um backend completamente separado, fora do
escopo da migração. Se precisar mexer nisso, vai ter que olhar o script do
Google Sheets por trás, que não faz parte deste repositório.

## Autenticação

- `functions/_middleware.js` roda antes de qualquer página ou `/api/*`.
- Sessão = cookie HTTP-only assinado por HMAC-SHA256 (`functions/_lib/auth.js`,
  Web Crypto nativo do Workers, sem dependência de JWT). Validade: 7 dias.
- Senha por projeto: env var `PASS_<CHAVE-DO-PROJETO-EM-MAIUSCULO>` (ex.:
  `PASS_PA`, `PASS_ESCALA6X1`). Senha de admin: `PASS_ADMIN`, acessa qualquer
  projeto e cai em `/admin` quando não há `?projeto=` na URL.
- Uma sessão de projeto específico só acessa aquele projeto — página e
  `/api/<projeto>/...`; tentar outro projeto ou `/admin` redireciona de volta
  pro próprio.
- `AUTH_SECRET` assina os cookies — sem ele o middleware recusa tudo com
  500. É uma variável de ambiente só, não vai pro banco nem pro código.

## Rodando local

```bash
npm install
cp .dev.vars.example .dev.vars   # preencher com valores reais (nunca commitar)
npm run dev                       # wrangler pages dev public, já com nodejs_compat
```
Abre em `http://localhost:8788`.

## Deploy (Cloudflare Pages)

Git integration já configurada (push em `main` dispara deploy). Configuração
do projeto no painel do Cloudflare:

- **Build command**: `npm install` (⚠️ não deixar vazio — ver Pegadinhas)
- **Build output directory**: `public`
- **Compatibility date**: igual ou mais recente que o `wrangler.toml`
- **Compatibility flags**: `nodejs_compat` (nos dois ambientes, Production e
  Preview)
- **Environment variables** (Settings → Environment variables, como
  "Secret", nos dois ambientes): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `AUTH_SECRET`, `PASS_ADMIN`, `PASS_PE`, `PASS_PA`, `PASS_MS`,
  `PASS_ESCALADA`, `PASS_ESCALA6X1`, `PASS_LARA`

## Pegadinhas conhecidas (já causaram erro real em produção)

- **`nodejs_compat` é obrigatório.** `@supabase/supabase-js` usa APIs do Node
  que o Workers não expõe por padrão. Sem a flag, qualquer Function que
  importa `_lib/supabase.js` quebra em runtime com erro genérico "internal
  error", sem stack trace útil.
- **Build command vazio faz o Cloudflare pular o `npm install`.** Sem
  `node_modules`, o bundler das Functions não resolve `@supabase/supabase-js`
  e o deploy falha com `Could not resolve "@supabase/supabase-js"`. O build
  command tem que ser `npm install` mesmo sem ter um passo de build de
  verdade.
- **Cloudflare Pages redireciona `/foo.html` → `/foo`** ("clean URLs")
  automaticamente. `_middleware.js`, `login.html` e `admin.html` foram
  escritos assumindo a forma sem extensão (`/login`, `/admin`) — usar a forma
  com `.html` em qualquer lugar novo pode causar loop de redirecionamento.
- **`/api/logout` precisa estar isento da checagem de "projeto correto"** no
  middleware (ele não é um endpoint de dados de um projeto). Já corrigido,
  mas é o tipo de coisa fácil de quebrar de novo se mexer no middleware sem
  reler essa lista.
- **Assets estáticos usados pela tela de login/admin (`/img/*`,
  `/config/projetos.json`) precisam estar na lista de rotas públicas do
  middleware** — senão a própria tela de login fica sem logo/favicon porque
  o middleware bloqueia os arquivos antes de existir sessão.
- **A integração Git do projeto no Cloudflare Pages pode desconectar
  sozinha** (mensagem "This project is disconnected from your Git account").
  Quando isso acontece, `git push` não dispara deploy nenhum — verificar em
  Settings do projeto no Cloudflare. Enquanto não reconectar, dá pra forçar
  deploy manual com `npx wrangler pages deploy public --project-name=dashboard-comunidades`.
- **`database.tnledu.shop` e `webhookn8n.tnledu.shop` são infraestrutura
  externa (self-hosted, domínio `.shop`)**, fora do controle do Cloudflare
  Pages. Se esse domínio cair (já aconteceu uma vez, instabilidade do TLD
  `.shop` inteiro), o dashboard todo para de trazer dado — sintoma no
  navegador é erro `{"error":"error code: 1016"}` (erro de DNS de origem do
  próprio Cloudflare). Não é bug do código; confirmar resolução DNS do
  domínio antes de sair debugando Function.
- **`escala6x1.dbProjeto` ("Escala 6x1") é diferente do `nome` de exibição**
  ("Brasil Quer Mais Tempo") — ver tabela de projetos acima. Qualquer código
  que precise do valor usado pelas RPCs do Supabase deve usar `dbProjeto`,
  nunca `nome`.

## Como adicionar um projeto novo

1. Confirmar o valor exato de `projetos.nome` pro projeto no Supabase (isso
   vira o `dbProjeto`).
2. Adicionar a entrada em `public/config/projetos.json`: `nome` (exibição),
   `dbProjeto`, `tabs` (normalmente só `["comunidades", "movimentacao"]`).
3. Adicionar a senha do projeto novo como env var `PASS_<CHAVE>` — local
   (`.dev.vars`) e em produção (Cloudflare Pages → Settings → Environment
   variables, nos dois ambientes).
4. Não precisa mexer em n8n nem em nenhuma outra config — as Functions em
   `functions/api/[projeto]/...` já são genéricas por manifesto.

## Como adicionar uma aba inteira exclusiva de um projeto

Adicionar a chave da aba em `tabs` do projeto certo no manifesto, criar o
botão correspondente em `public/index.html` (sidebar) e o módulo em
`public/js/tabs/<aba>.js`, seguindo o padrão dos módulos existentes
(`usinas.js`, `presenca.js`).

## Como adicionar uma feature exclusiva dentro de uma aba compartilhada

Ver `PADRAO-EXTENSAO-ABA-COMPARTILHADA.md` — é o documento certo pra esse
caso específico, com passo a passo e checklist.
