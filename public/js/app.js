    // =========================================================================
    // BOOT: RESOLVE O PROJETO ATIVO E CARREGA O MANIFESTO CENTRAL
    // =========================================================================
    const urlParams = new URLSearchParams(window.location.search);
    let PROJETO_ATIVO = urlParams.get('projeto') || 'pe';
    let PROJETOS_CONFIG = null;
    let configAtual = null;

    // =========================================================================
    // REGISTRO DE FEATURES (extensões específicas de projeto dentro de abas
    // compartilhadas — ver PADRAO-EXTENSAO-ABA-COMPARTILHADA.md)
    // =========================================================================
    const FEATURE_HANDLERS = {};

    function registerFeature(nome, handlers) {
      FEATURE_HANDLERS[nome] = handlers;
    }

    function getFeaturesForTab(tabId) {
      if (!configAtual || !configAtual.features) return [];
      return configAtual.features[tabId] || [];
    }

    function runTabFeatures(tabId, ...args) {
      getFeaturesForTab(tabId).forEach(nome => {
        const handler = FEATURE_HANDLERS[nome];
        if (handler && typeof handler.render === 'function') handler.render(...args);
      });
    }

    // =========================================================================
    // ESTADOS GLOBAIS E UTILITÁRIOS
    // =========================================================================
    const COMMUNITY_STATE = { dashboardData: null, mensagensProcessadas: [], pagination: {}, isLoaded: false };
    const MOVIMENTACAO_STATE = { data: null, isLoaded: false };
    const PRESENCA_STATE = { isLoaded: false };
    const USINAS_STATE = { dataset: null, filteredDaily: [], charts: {}, rankingPeriod: [], rankingMonthly: [], rankingGeneral: [], activeMonth: null };

    let engagementChartInstance = null;
    let movChartInstance = null;
    let presencaChartInstance = null;

    function $(id) { return document.getElementById(id); }

    function escapeHtml(unsafe) {
      return (unsafe || '').toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function formatDateTimeCommunity(isoString) {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // =========================================================================
    // INICIALIZAÇÃO DA INTERFACE DINÂMICA
    // =========================================================================
    function inicializarInterface() {
      // Ajusta os Títulos
      document.getElementById('header-title').textContent = configAtual.nome;
      document.title = "Dashboard - " + configAtual.nome;

      // Exibe apenas os botões das abas permitidas para o projeto atual
      configAtual.tabs.forEach(aba => {
        const btn = document.getElementById(`btn-tab-${aba}`);
        if (btn) btn.classList.remove('hidden');
      });

      // Simula o clique na primeira aba disponível (geralmente "comunidades")
      const abaInicial = configAtual.tabs[0];
      const btnInicial = document.getElementById(`btn-tab-${abaInicial}`);
      if(btnInicial) btnInicial.click();

      // Mostra containers de features exclusivas dentro de abas compartilhadas
      // (ver PADRAO-EXTENSAO-ABA-COMPARTILHADA.md)
      const votoRankingPaAtivo = getFeaturesForTab('comunidades').includes('voto-ranking-pa');
      const votoRankingPaEl = document.getElementById('comm-pa-voto-ranking');
      if (votoRankingPaEl) votoRankingPaEl.classList.toggle('hidden', !votoRankingPaAtivo);
    }

    // =========================================================================
    // CONTROLES DO MULTI-SELECT (COMPARTILHADO)
    // =========================================================================
    function toggleMultiSelect(btn) {
      const dropdown = btn.nextElementSibling;
      const isVisible = dropdown.style.display === 'block';
      document.querySelectorAll('.multi-select-dropdown').forEach(d => d.style.display = 'none');
      dropdown.style.display = isVisible ? 'none' : 'block';
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.multi-select-container')) {
        document.querySelectorAll('.multi-select-dropdown').forEach(d => d.style.display = 'none');
      }
    });

    function toggleOption(item) {
      const container = item.closest('.multi-select-container');
      const selected = container.querySelectorAll('.multi-select-item.selected:not([onclick^="selectAll"])');
      const label = container.querySelector('.selected-label');

      const isComunidade = container.id.includes('comunidades');
      const textoVazio = isComunidade ? "Todas as Comunidades" : "Todas as Campanhas";
      const textoPlural = isComunidade ? "Comunidades" : "Campanhas";

      if (selected.length === 0) label.textContent = textoVazio;
      else if (selected.length === 1) label.textContent = selected[0].textContent.trim();
      else label.textContent = `${selected.length} ${textoPlural}`;
    }

    function selectAllCampaigns(btn) {
      const container = btn.closest('.multi-select-container');
      const items = container.querySelectorAll('.multi-select-item:not([onclick^="selectAll"])');

      items.forEach(i => {
        i.classList.remove('selected');
        const box = i.querySelector('.icon-box');
        if(box) box.classList.remove('bg-blue-500', 'border-blue-500');
      });

      const isComunidade = container.id.includes('comunidades');
      container.querySelector('.selected-label').textContent = isComunidade ? "Todas as Comunidades" : "Todas as Campanhas";
      btn.parentElement.style.display = 'none';
    }

    function getSelectedCampaigns(containerId) {
      const container = document.getElementById(containerId);
      if(!container) return [];
      return Array.from(container.querySelectorAll('.multi-select-item.selected:not([onclick^="selectAll"])')).map(el => el.textContent.trim());
    }

    function populateMultiSelect(containerId, optionsList) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const listElement = container.querySelector('.options-list');
      listElement.innerHTML = '';
      optionsList.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'multi-select-item';
        div.innerHTML = `<div class="w-3 h-3 rounded border border-slate-500 mr-1 flex items-center justify-center icon-box"></div> ${escapeHtml(opt)}`;
        div.onclick = function(e) {
          e.stopPropagation();
          this.classList.toggle('selected');
          const box = this.querySelector('.icon-box');
          if(this.classList.contains('selected')) box.classList.add('bg-blue-500', 'border-blue-500');
          else box.classList.remove('bg-blue-500', 'border-blue-500');
          toggleOption(this);
        };
        listElement.appendChild(div);
      });
    }

    // =========================================================================
    // CONTROLE DA BARRA LATERAL E NAVEGAÇÃO ENTRE ABAS
    // =========================================================================
    let sidebarOpen = false;
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      sidebarOpen = !sidebarOpen;
      const sidebar = document.getElementById('sidebar');
      const main = document.getElementById('main-content');
      if (sidebarOpen) {
        sidebar.classList.remove('-translate-x-full');
        if (window.innerWidth >= 768) main.classList.add('md:ml-64');
      } else {
        sidebar.classList.add('-translate-x-full');
        main.classList.remove('md:ml-64');
      }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => {
          // Aqui eu adicionei o "justify-start" e "text-left" na classe padrão inativa
          b.className = "tab-btn w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all font-medium text-left";
          if(!configAtual.tabs.includes(b.getAttribute('data-tab'))) b.classList.add('hidden');
        });

        // E aqui eu adicionei na classe ativa (quando o botão está azulzinho)
        btn.className = "tab-btn w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium transition-all text-left";

        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        const targetId = `tab-${btn.getAttribute('data-tab')}`;
        document.getElementById(targetId).classList.remove('hidden');

        // Lazy Loading Dinâmico
        if (targetId === 'tab-comunidades') loadCommunityData();
        if (targetId === 'tab-movimentacao') loadMovimentacaoData();
        if (targetId === 'tab-presenca' && PROJETO_ATIVO === 'pe') loadPresencaData();
        if (targetId === 'tab-usinas' && PROJETO_ATIVO === 'pa') initUsinas();
        if (targetId === 'tab-novo-usinas' && PROJETO_ATIVO === 'pa') initNovoUsinas();

        if (window.innerWidth < 768) {
          sidebarOpen = false;
          document.getElementById('sidebar').classList.add('-translate-x-full');
        }
      });
    });

    // =========================================================================
    // INICIALIZAÇÃO DO DASHBOARD UNIFICADO
    // =========================================================================
    async function bootDashboard() {
      const res = await fetch('config/projetos.json');
      PROJETOS_CONFIG = await res.json();

      // Fallback seguro caso o parâmetro ?projeto= não exista no manifesto
      if (!PROJETOS_CONFIG.projects[PROJETO_ATIVO]) {
        PROJETO_ATIVO = 'pe';
      }
      const proj = PROJETOS_CONFIG.projects[PROJETO_ATIVO];
      configAtual = {
        nome: proj.nome,
        slug: proj.slug || PROJETO_ATIVO,
        tabs: proj.tabs,
        features: proj.features || {}
      };

      inicializarInterface();
      // O Lazy Load (loadCommunityData) é acionado pelo clique na aba,
      // que ocorre dentro do inicializarInterface() -> btnInicial.click()
      lucide.createIcons();
    }

    window.addEventListener('DOMContentLoaded', () => {
      bootDashboard();
    });
