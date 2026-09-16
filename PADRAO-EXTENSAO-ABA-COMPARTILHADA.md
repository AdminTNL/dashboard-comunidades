# Padrão: extensão específica de projeto dentro de uma aba compartilhada

Este documento descreve como implementar, no `oficial.html`, uma funcionalidade que é
específica de **um único projeto** mas vive dentro de uma aba que hoje é
**100% compartilhada** entre todos os projetos (ex.: `comunidades`/Engajamento,
`movimentacao`/Movimentação da Base).

Use este documento como instrução de execução quando o pedido for do tipo:
"preciso adicionar algo só para o projeto X dentro da aba Y, que hoje todo
mundo usa".

## Contexto do sistema (não repetir, só ler antes de agir)

- `oficial.html` é o dashboard unificado de todos os projetos (PE, PA, MS,
  Escalada, Escala 6x1). Arquivos antigos (`escalada.html`, `para.html`,
  `pernambuco.html`, `ms.html`) são legados pré-unificação e não devem ser
  editados.
- O projeto ativo é definido por `?projeto=xx` na URL e resolvido na variável
  `PROJETO_ATIVO` / objeto `configAtual` (dicionário `CONFIG_PROJETOS`, no
  topo do bloco `<script>`).
- `configAtual.abas` controla quais botões da sidebar (`data-tab`) aparecem
  para aquele projeto. Isso já resolve o caso de **aba inteira exclusiva**
  (ex.: `presenca` só existe para PE, `usinas`/`novo-usinas` só para PA).
- O problema que este documento resolve é diferente: a aba **precisa
  continuar aparecendo para todos**, mas com um pedaço de conteúdo/lógica que
  só roda para um projeto específico.

## Princípio

**Nunca duplicar a aba nem criar um arquivo/página separada para o projeto.**
Isso reintroduz o problema original (mudar em N lugares). Em vez disso,
tratar a necessidade específica como um **bloco de extensão opcional** dentro
da mesma aba compartilhada, seguindo o mesmo idioma que o arquivo já usa para
abas exclusivas (`if (PROJETO_ATIVO === 'pa') { ... }`, visto nas guardas de
segurança das funções `initUsinas`/`initNovoUsinas`).

## Passo a passo

1. **HTML — container isolado e escondido por padrão**
   Dentro da seção compartilhada (`<section id="tab-comunidades">` ou
   equivalente), adicionar um novo bloco com id próprio e classe `hidden`,
   por exemplo:
   ```html
   <div id="comm-pa-extra" class="hidden">
     <!-- conteúdo específico do projeto aqui -->
   </div>
   ```
   Não usar `configAtual.abas` para isso — esse array só controla abas
   inteiras. A visibilidade deste bloco é feita via JS (passo 3).

2. **JS — módulo isolado e comentado**
   Criar um bloco de funções separado, com o mesmo estilo de comentário de
   cabeçalho que o arquivo já usa para módulos:
   ```js
   // =========================================================================
   // MÓDULO X: <NOME DA FEATURE> - EXCLUSIVO <PROJETO>
   // =========================================================================
   function renderExtra<Nome><Projeto>(dadosJaFiltrados) {
     // busca/cruzamento/renderização específica do projeto
   }
   ```
   Toda a lógica nova fica dentro dessa função (ou de funções auxiliares
   dela). Não espalhar `if/else` de projeto dentro das funções
   compartilhadas existentes.

3. **Mostrar o bloco só para o projeto certo**
   Em `inicializarInterface()`, junto com o restante da configuração de UI
   por projeto:
   ```js
   if (PROJETO_ATIVO === 'pa') {
     document.getElementById('comm-pa-extra').classList.remove('hidden');
   }
   ```

4. **Plugar a execução no fluxo compartilhado com uma única chamada guardada**
   No final da função de renderização compartilhada da aba (ex.:
   `renderCommunityDashboard()`), adicionar **uma linha** condicional:
   ```js
   if (PROJETO_ATIVO === 'pa') renderExtraVotoRankingPA(filtered);
   ```
   Isso reaproveita os dados já carregados/filtrados pela aba compartilhada
   (mesmos filtros de data, campanha, comunidade etc.) sem duplicar lógica de
   filtro. A função compartilhada não sabe "o que" a extensão faz — só sabe
   que, se for aquele projeto, chama a função dele.

5. **Fetch de dados extras, se precisar de outra fonte**
   Se a feature exigir uma base de dados adicional (ex.: cruzar votantes com
   uma base própria de PA), fazer esse fetch dentro do módulo isolado do
   passo 2, não dentro de `loadCommunityData()`. Cachear em um estado próprio
   (ex.: `const PA_VOTO_STATE = { isLoaded: false, dados: null };`) para não
   buscar de novo a cada render.

## Quando promover para um mecanismo mais genérico

Esse padrão de `if (PROJETO_ATIVO === 'xx')` direto é intencionalmente
simples e não deve ser generalizado cedo demais. Só considerar migrar para um
sistema de hooks (ex.: `PROJECT_HOOKS[PROJETO_ATIVO]?.afterRenderComunidades?.(dados)`)
se esse padrão precisar se repetir em **3 ou mais pontos diferentes** do
código. Até lá, a duplicação de um `if` simples é preferível à indireção de
um sistema de plugins que só tem um usuário.

## Checklist rápido para o agente executar

- [ ] Identificar a aba compartilhada e a função de renderização principal
      dela.
- [ ] Criar o container HTML `hidden` dentro da seção da aba.
- [ ] Criar o módulo JS isolado com o comentário de cabeçalho padrão
      (`MÓDULO X: ... - EXCLUSIVO <PROJETO>`).
- [ ] Mostrar/esconder o container em `inicializarInterface()` conforme
      `PROJETO_ATIVO`.
- [ ] Plugar a chamada da função nova como uma única linha condicional no
      final da função de renderização compartilhada.
- [ ] Não tocar nos arquivos legados (`escalada.html`, `para.html`,
      `pernambuco.html`, `ms.html`).
- [ ] Não adicionar `if` de projeto espalhado dentro da lógica compartilhada
      além do ponto único de chamada do passo 4.
