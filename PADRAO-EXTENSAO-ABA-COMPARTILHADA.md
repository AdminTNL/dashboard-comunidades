# Padrão: extensão específica de projeto dentro de uma aba compartilhada

Este documento descreve como implementar, no dashboard unificado (`public/`),
uma funcionalidade que é específica de **um único projeto** mas vive dentro de
uma aba que é **100% compartilhada** entre todos os projetos (ex.:
`comunidades`/Engajamento, `movimentacao`/Movimentação da Base).

Use este documento como instrução de execução quando o pedido for do tipo:
"preciso adicionar algo só para o projeto X dentro da aba Y, que hoje todo
mundo usa". Para o resto do funcionamento do projeto, veja primeiro o
`CLAUDE.md` na raiz do repositório.

## Contexto do sistema (não repetir, só ler antes de agir)

- O front-end mora em `public/`: `public/index.html` é o shell (HTML das
  abas), `public/js/app.js` é o núcleo (boot, utils compartilhados, registro
  de features), `public/js/tabs/*.js` é um módulo por aba, `public/js/features/*.js`
  são as features exclusivas de projeto.
- `public/config/projetos.json` é o manifesto: define, por projeto, `tabs`
  (quais abas ele vê) e `features` (quais features exclusivas ficam ativas
  dentro de cada aba compartilhada).
- `configAtual.tabs` controla abas inteiras exclusivas (ex.: `presenca` só
  para PE, `usinas`/`novo-usinas` só para PA). **Isso não é o problema deste
  documento** — se o pedido for "aba inteira nova só pra um projeto", é só
  mexer no manifesto e criar o módulo em `public/js/tabs/`.
- O problema que este documento resolve é diferente: a aba **precisa
  continuar aparecendo pra todos**, mas com um pedaço de conteúdo/lógica que
  só roda pra um projeto específico.

## Princípio

**Nunca duplicar a aba nem criar uma página separada para o projeto.** Em vez
disso, a feature se registra num mecanismo de plugin (`registerFeature`,
definido em `public/js/app.js`) e o manifesto decide, por projeto, quais
features rodam em qual aba. A função de renderização compartilhada da aba não
sabe nada sobre a feature — só chama `runTabFeatures('<tab>', dados)` no final
e o registro decide o que rodar.

Exemplo real já implementado: `voto-ranking-pa` (cruzamento de votantes das
enquetes com a base de comissionados do Pará), dentro da aba `comunidades`.
Use os arquivos abaixo como referência ao criar uma feature nova.

## Passo a passo

1. **Backend, se precisar de dado novo**: criar `functions/api/<algo>.js`
   (Cloudflare Pages Function) que chama a RPC do Supabase necessária, usando
   `functions/_lib/supabase.js` e `functions/_lib/response.js`. Ver
   `functions/api/pa/voto-ranking.js` como referência. Se a RPC ainda não
   existe no Supabase, ela precisa ser criada/alterada manualmente pelo
   usuário no SQL Editor — você não tem acesso direto pra rodar DDL lá.

2. **HTML — container isolado e escondido por padrão**: dentro da seção
   compartilhada (`<section id="tab-comunidades">` ou equivalente, em
   `public/index.html`), adicionar um bloco com id próprio e classe `hidden`:
   ```html
   <div id="comm-pa-voto-ranking" class="hidden space-y-6">
     <!-- conteúdo específico do projeto aqui -->
   </div>
   ```

3. **JS — módulo de feature isolado**: criar `public/js/features/<nome>.js`,
   com o cabeçalho padrão de módulo, e terminar o arquivo registrando a
   feature:
   ```js
   registerFeature('voto-ranking-pa', {
     render() {
       // busca os dados (fetch pra Function do passo 1) e renderiza no
       // container do passo 2. Recebe os mesmos args que a aba passa pra
       // runTabFeatures (ex.: as mensagens já filtradas).
     }
   });
   ```
   Adicionar `<script src="js/features/<nome>.js"></script>` em
   `public/index.html`, depois dos scripts de `public/js/tabs/`.

4. **Ligar a feature ao projeto no manifesto** (`public/config/projetos.json`):
   ```json
   "pa": {
     "...": "...",
     "features": { "comunidades": ["voto-ranking-pa"] }
   }
   ```
   Isso é o que faz `getFeaturesForTab('comunidades')` incluir a feature só
   pra quem tem ela listada.

5. **Mostrar/esconder o container certo**: em `inicializarInterface()`
   (`public/js/app.js`), adicionar uma linha:
   ```js
   const votoRankingPaAtivo = getFeaturesForTab('comunidades').includes('voto-ranking-pa');
   document.getElementById('comm-pa-voto-ranking')?.classList.toggle('hidden', !votoRankingPaAtivo);
   ```

6. **Plugar a execução no fluxo compartilhado**: no final da função de
   renderização compartilhada da aba (ex.: `renderCommunityDashboard()` em
   `public/js/tabs/comunidades.js`), adicionar:
   ```js
   runTabFeatures('comunidades', filtered);
   ```
   Isso já existe hoje — uma feature nova na mesma aba não precisa mexer
   aqui, só se registrar (passo 3) e aparecer no manifesto (passo 4).

## Quando isso não é o suficiente

Se a feature precisar de um comportamento de plugin mais rico do que
"renderizar quando a aba compartilhada renderiza" (ex.: rodar num evento
diferente, expor mais de uma função), estenda o objeto passado pro
`registerFeature` com mais campos e ajuste `runTabFeatures`/quem a chama —
mas isso ainda não foi necessário até hoje (uma única feature registrada).

## Checklist rápido para o agente executar

- [ ] Se precisar de dado novo do Supabase: criar a Function em
      `functions/api/...` e, se preciso, pedir ao usuário pra rodar o SQL da
      RPC nova (você não tem acesso direto ao SQL Editor do Supabase).
- [ ] Criar o container HTML `hidden` dentro da seção da aba compartilhada.
- [ ] Criar `public/js/features/<nome>.js` terminando com `registerFeature(...)`.
- [ ] Adicionar o `<script src="js/features/<nome>.js">` em `public/index.html`.
- [ ] Adicionar a feature em `features.<tab>` do projeto certo em
      `public/config/projetos.json`.
- [ ] Mostrar/esconder o container em `inicializarInterface()` conforme
      `getFeaturesForTab(...)`.
- [ ] Confirmar que `runTabFeatures('<tab>', ...)` já é chamado no final da
      função de renderização compartilhada daquela aba (geralmente já é).
- [ ] Não tocar nos arquivos em `legado/` (histórico pré-unificação, fora de
      uso).
- [ ] Não adicionar `if (PROJETO_ATIVO === 'xx')` espalhado dentro da lógica
      compartilhada — isso é exatamente o que o registro de features evita.
