    // =========================================================================
    // MÓDULO 1: COMUNIDADES (ENGAJAMENTO) - COMPARTILHADO
    // =========================================================================
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('toggle-preview-btn')) {
        const container = e.target.closest('.preview-container');
        const textSpan = container.querySelector('.preview-text');
        const isExpanded = container.classList.contains('is-expanded');
        if (isExpanded) {
          textSpan.innerHTML = container.getAttribute('data-short');
          e.target.textContent = 'Ver tudo';
          container.classList.remove('is-expanded');
        } else {
          textSpan.innerHTML = container.getAttribute('data-full').replace(/\n/g, '<br>');
          e.target.textContent = 'Ver menos';
          container.classList.add('is-expanded');
        }
      }
    });

    function toggleInteractions(msgId, tipo) {
      const container = document.getElementById(`list-${msgId}`);
      const content = document.getElementById(`list-content-${msgId}`);
      const title = document.getElementById(`list-title-${msgId}`);
      const msg = COMMUNITY_STATE.mensagensProcessadas.find(m => m.id_mensagem === msgId);
      if (!msg) return;

      const lista = tipo === 'reacoes' ? (msg.reacoes || []) : (msg.votos || []);
      const cor = tipo === 'reacoes' ? 'rose' : 'amber';
      
      title.textContent = tipo === 'reacoes' ? 'Quem Reagiu' : 'Quem Votou';
      title.className = `text-xs font-bold uppercase tracking-widest text-${cor}-400`;

      content.innerHTML = lista.map(p => `
        <div class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-lg border border-slate-800">
          <div class="w-8 h-8 rounded-full bg-${cor}-500/10 flex items-center justify-center text-${cor}-400 text-[10px] font-bold">
            ${(p.nome_contato || 'P').substring(0,1).toUpperCase()}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold text-slate-200 truncate">${escapeHtml(p.nome_contato || 'Participante')}</p>
            <p class="text-[10px] text-slate-500 font-mono">${escapeHtml(p.telefone || '')}</p>
          </div>
        </div>
      `).join('');
      container.classList.remove('hidden');
    }

    function scrollToMessage(msgId) {
      const msg = COMMUNITY_STATE.mensagensProcessadas.find(m => m.id_mensagem === msgId);
      if (!msg) return;

      const campanhaAlvo = msg.campanha || 'Campanha Desconhecida';
      const projectFilter = document.getElementById('comm-project-filter').value;
      const selectedCampaigns = getSelectedCampaigns('container-campanhas-comm');
      const startDate = document.getElementById('comm-start-date').value;
      const endDate = document.getElementById('comm-end-date').value;

      let filtered = COMMUNITY_STATE.mensagensProcessadas.filter(m => {
        if (projectFilter !== 'todos' && m.projeto !== projectFilter) return false;
        if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(m.campanha)) return false;
        if (startDate || endDate) {
          const msgDateStr = (m.data_evento || '').split('T')[0];
          if (startDate && msgDateStr < startDate) return false;
          if (endDate && msgDateStr > endDate) return false;
        }
        return true;
      });

      const msgsDaCampanha = filtered.filter(m => (m.campanha || 'Campanha Desconhecida') === campanhaAlvo);
      const posicaoAlvo = msgsDaCampanha.findIndex(m => m.id_mensagem === msgId);

      if (posicaoAlvo !== -1) {
        const itensNecessarios = posicaoAlvo + 1;
        const limiteAtual = COMMUNITY_STATE.pagination[campanhaAlvo] || parseInt(document.getElementById('comm-limit-filter').value) || 10;
        if (itensNecessarios > limiteAtual) {
          COMMUNITY_STATE.pagination[campanhaAlvo] = itensNecessarios;
          renderCommunityDashboard();
        }
      }

      setTimeout(() => {
        const element = document.getElementById(`msg-${msgId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500', 'bg-blue-500/10', 'transform', 'scale-[1.02]');
          setTimeout(() => { element.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-500/10', 'transform', 'scale-[1.02]'); }, 2000);
        }
      }, 100);
    }

    function renderCommunityBI(msgs) {
      const container = document.getElementById('comm-bi-container');
      if (!msgs || msgs.length === 0) { container.classList.add('hidden'); return; }
      container.classList.remove('hidden');

      const userMap = {}; const dateMap = {};
      msgs.forEach(msg => {
        const processEngagement = (eng, tipo) => {
          const id = eng.telefone || eng.nome_contato || 'anon';
          if (!userMap[id]) userMap[id] = { nome: eng.nome_contato || 'Participante', telefone: eng.telefone || '', total: 0 };
          userMap[id].total++;

          const dateStr = (eng.data_evento || msg.data_evento || '').split('T')[0];
          if (dateStr) {
            if (!dateMap[dateStr]) dateMap[dateStr] = 0;
            dateMap[dateStr]++;
          }
        };
        (msg.reacoes || []).forEach(r => processEngagement(r, 'reacao'));
        (msg.votos || []).forEach(v => processEngagement(v, 'voto'));
      });

      const topUsers = Object.values(userMap).sort((a, b) => b.total - a.total).slice(0, 5);
      document.getElementById('bi-ranking-list').innerHTML = topUsers.map((u, i) => `
        <div class="flex items-center justify-between p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-700">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">${i + 1}º</div>
            <p class="text-xs font-semibold text-slate-200 truncate" title="${escapeHtml(u.nome)}">${escapeHtml(u.nome)}</p>
          </div>
          <span class="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold shrink-0">${u.total} <span class="hidden sm:inline font-normal opacity-80">ações</span></span>
        </div>
      `).join('') || '<p class="text-xs text-slate-500 text-center py-4">Sem interações</p>';

      const topMsg = [...msgs].sort((a, b) => (b.total_engajamentos || 0) - (a.total_engajamentos || 0))[0];
      const topMsgContainer = document.getElementById('bi-top-msg');
      if (topMsg && topMsg.total_engajamentos > 0) {
        const shortPreview = (topMsg.texto_preview || '').length > 70 ? (topMsg.texto_preview || '').substring(0, 70) + '...' : (topMsg.texto_preview || '');
        topMsgContainer.innerHTML = `
          <p class="text-xs text-slate-300 italic mb-3 leading-relaxed">"${escapeHtml(shortPreview)}"</p>
          <div class="flex gap-3 mt-auto">
              <div class="flex-1 bg-slate-800/50 p-2 rounded-lg text-center border border-slate-700/50">
                <p class="text-[9px] text-slate-500 uppercase font-bold">Reações</p>
                <p class="text-sm font-bold text-rose-400">${topMsg.reacoes?.length || 0}</p>
              </div>
              <div class="flex-1 bg-slate-800/50 p-2 rounded-lg text-center border border-slate-700/50">
                <p class="text-[9px] text-slate-500 uppercase font-bold">Votos</p>
                <p class="text-sm font-bold text-amber-400">${topMsg.votos?.length || 0}</p>
              </div>
              <button onclick="scrollToMessage('${topMsg.id_mensagem}')" class="w-full mt-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-500/20 transition-all flex items-center justify-center gap-2">
                <i data-lucide="eye" class="w-3 h-3"></i> Ver
              </button>
          </div>`;
      } else {
        topMsgContainer.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">Nenhuma mensagem engajada no filtro</p>';
      }

      const sortedDates = Object.keys(dateMap).sort();
      const ctx = document.getElementById('engagementChart').getContext('2d');
      if (engagementChartInstance) engagementChartInstance.destroy();
      engagementChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedDates.map(d => d.split('-').reverse().slice(0,2).join('/')),
          datasets: [{
            label: 'Engajamentos', data: sortedDates.map(d => dateMap[d]),
            borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)',
            borderWidth: 2, tension: 0.4, fill: true,
            pointBackgroundColor: '#020617', pointBorderColor: '#34d399', pointBorderWidth: 2, pointRadius: 3
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', stepSize: 1 } }
          }
        }
      });
    }

    function renderCommunityKpis(msgs) {
      let reacoes = 0; let votos = 0;
      msgs.forEach(m => { reacoes += (m.reacoes || []).length; votos += (m.votos || []).length; });
      const kpis = [
        { title: 'Mensagens', value: msgs.length, icon: 'message-square', color: 'blue' },
        { title: 'Engajamentos', value: reacoes + votos, icon: 'activity', color: 'emerald' },
        { title: 'Total de Reações', value: reacoes, icon: 'heart', color: 'rose' },
        { title: 'Total de Votos', value: votos, icon: 'bar-chart', color: 'amber' }
      ];
      document.getElementById('comm-kpis-container').innerHTML = kpis.map(k => `
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-${k.color}-500 relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-${k.color}-500/10 rounded-full blur-xl group-hover:bg-${k.color}-500/20 transition-colors"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-2">
              <i data-lucide="${k.icon}" class="w-5 h-5 text-${k.color}-400"></i>
              <h3 class="text-sm font-medium text-slate-400">${k.title}</h3>
            </div>
            <p class="text-3xl font-bold text-slate-100">${k.value.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      `).join('');
    }

    function createMessageCard(msg) {
      const reacoes = msg.reacoes || []; const votos = msg.votos || [];
      const textoReal = msg.texto_preview || "(Sem texto)";
      const isLong = textoReal.length > 150;
      const textoCurto = isLong ? textoReal.substring(0, 150) + '...' : textoReal;

      const card = document.createElement('div');
      card.className = "bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-colors";
      card.id = `msg-${msg.id_mensagem}`;
      card.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-1 bg-slate-900/80 rounded-md text-xs font-medium text-slate-300 border border-slate-700">${escapeHtml(msg.tipo || 'Mensagem')}</span>
              <span class="text-xs text-slate-400">${formatDateTimeCommunity(msg.data_evento)}</span>
            </div>
            <h4 class="text-sm font-medium text-slate-200 mt-2">${escapeHtml(msg.comunidade || 'Comunidade')}</h4>
          </div>
          <div class="flex gap-4 text-center">
            <div class="flex flex-col gap-1">
                <div class="px-3 py-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <p class="text-xs text-rose-400/80 font-medium mb-0.5">Reações</p>
                  <p class="text-lg font-bold text-rose-400">${reacoes.length}</p>
                </div>
                ${reacoes.length > 0 ? `<button onclick="toggleInteractions('${msg.id_mensagem}', 'reacoes')" class="text-[10px] text-rose-400 hover:text-rose-300 underline underline-offset-2">Ver Lista</button>` : ''}
            </div>
            <div class="flex flex-col gap-1">
                <div class="px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p class="text-xs text-amber-400/80 font-medium mb-0.5">Votos</p>
                  <p class="text-lg font-bold text-amber-400">${votos.length}</p>
                </div>
                ${votos.length > 0 ? `<button onclick="toggleInteractions('${msg.id_mensagem}', 'votos')" class="text-[10px] text-amber-400 hover:text-amber-300 underline underline-offset-2">Ver Lista</button>` : ''}
            </div>
          </div>
        </div>
        <div class="mt-3 bg-slate-900/60 rounded-lg p-4 border border-slate-700/50">
          <div class="flex items-start gap-3">
            <i data-lucide="message-circle" class="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0"></i>
            <div class="text-sm text-slate-300 leading-relaxed preview-container" data-full="${escapeHtml(textoReal)}" data-short="${escapeHtml(textoCurto)}">
              <span class="preview-text whitespace-pre-wrap">${escapeHtml(textoCurto)}</span>
              ${isLong ? `<button class="toggle-preview-btn text-blue-400 hover:text-blue-300 ml-1 font-semibold underline decoration-blue-500/30 underline-offset-2">Ver tudo</button>` : ''}
            </div>
          </div>
        </div>
        <div id="list-${msg.id_mensagem}" class="hidden mt-4 pt-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex items-center justify-between mb-3">
               <h5 id="list-title-${msg.id_mensagem}" class="text-xs font-bold uppercase tracking-widest text-slate-400">Participantes</h5>
               <button onclick="document.getElementById('list-${msg.id_mensagem}').classList.add('hidden')" class="text-slate-500 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <div id="list-content-${msg.id_mensagem}" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scroll"></div>
        </div>
      `;
      return card;
    }

    function renderCommunityDashboard() {
      const msgs = COMMUNITY_STATE.mensagensProcessadas || [];
      const projectFilter = document.getElementById('comm-project-filter').value;
      const selectedCampaigns = getSelectedCampaigns('container-campanhas-comm');
      const selectedComunidades = getSelectedCampaigns('container-comunidades-comm');
      const startDate = document.getElementById('comm-start-date').value;
      const endDate = document.getElementById('comm-end-date').value;
      const limitPerPage = parseInt(document.getElementById('comm-limit-filter').value) || 10;

      let filtered = msgs.filter(msg => {
        if (projectFilter !== 'todos' && msg.projeto !== projectFilter) return false;
        if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(msg.campanha)) return false;
        if (selectedComunidades.length > 0 && !selectedComunidades.includes(msg.comunidade)) return false;
        if (startDate || endDate) {
          const msgDateStr = (msg.data_evento || '').split('T')[0];
          if (startDate && msgDateStr < startDate) return false;
          if (endDate && msgDateStr > endDate) return false;
        }
        return true;
      });

      renderCommunityKpis(filtered);
      renderCommunityBI(filtered);
      runTabFeatures('comunidades', filtered);

      const msgsByCampaign = {};
      filtered.forEach(msg => {
        const camp = msg.campanha || 'Campanha Desconhecida';
        if (!msgsByCampaign[camp]) msgsByCampaign[camp] = [];
        msgsByCampaign[camp].push(msg);
      });

      const container = document.getElementById('comm-campaigns-container');
      container.innerHTML = '';
      const campanhas = Object.keys(msgsByCampaign).sort();
      
      if (campanhas.length === 0) {
        container.innerHTML = `<div class="text-center py-12 glass-panel rounded-2xl"><i data-lucide="inbox" class="w-12 h-12 text-slate-600 mx-auto mb-3"></i><h3 class="text-lg font-medium text-slate-300">Nenhum resultado</h3></div>`;
        lucide.createIcons();
        return;
      }

      campanhas.forEach(campanha => {
        const campanhaMsgs = msgsByCampaign[campanha];
        if (!COMMUNITY_STATE.pagination[campanha]) COMMUNITY_STATE.pagination[campanha] = limitPerPage;
        
        const currentLimit = COMMUNITY_STATE.pagination[campanha];
        const msgsToShow = campanhaMsgs.slice(0, currentLimit);

        const campBlock = document.createElement('div');
        campBlock.className = "glass-panel rounded-2xl p-6 border border-slate-700/50";
        campBlock.innerHTML = `<div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800"><div class="p-2 bg-blue-500/10 rounded-lg text-blue-400"><i data-lucide="folder" class="w-5 h-5"></i></div><div><h3 class="text-lg font-bold text-slate-200">${escapeHtml(campanha)}</h3><p class="text-xs text-slate-500 mt-0.5">${campanhaMsgs.length} mensagem(ns) no total</p></div></div>`;
        
        const cardsGrid = document.createElement('div');
        cardsGrid.className = "space-y-4";
        msgsToShow.forEach(msg => cardsGrid.appendChild(createMessageCard(msg)));
        campBlock.appendChild(cardsGrid);

        if (campanhaMsgs.length > currentLimit) {
          const loadMoreBtn = document.createElement('button');
          loadMoreBtn.className = "w-full py-3 mt-5 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all text-sm font-medium flex items-center justify-center gap-2 group";
          loadMoreBtn.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 group-hover:rotate-90 transition-transform"></i> Ver mais resultados (${campanhaMsgs.length - currentLimit} restantes)`;
          loadMoreBtn.onclick = () => { COMMUNITY_STATE.pagination[campanha] += limitPerPage; renderCommunityDashboard(); };
          campBlock.appendChild(loadMoreBtn);
        }
        container.appendChild(campBlock);
      });
      lucide.createIcons();
    }

    function setCommunityDefaultDates() {
      const msgs = COMMUNITY_STATE.mensagensProcessadas;
      if (!msgs || msgs.length === 0) return;
      const timestamps = msgs.map(m => new Date(m.data_evento).getTime()).filter(t => !isNaN(t));
      if (timestamps.length === 0) return;
      
      const minTs = Math.min(...timestamps);
      const maxTs = Math.max(...timestamps);

      document.getElementById('comm-start-date').value = new Date(minTs).toISOString().split('T')[0];
      document.getElementById('comm-end-date').value = new Date(maxTs).toISOString().split('T')[0];

      const label = document.getElementById('history-range-label');
      if (label) label.textContent = `Histórico Detectado: ${new Date(minTs).toLocaleDateString('pt-BR')} até ${new Date(maxTs).toLocaleDateString('pt-BR')}`;
    }

    function populateCommunityFilters() {
      const campanhas = [...new Set(COMMUNITY_STATE.mensagensProcessadas.map(m => m.campanha).filter(Boolean))].sort();
      const projetos = [...new Set(COMMUNITY_STATE.mensagensProcessadas.map(m => m.projeto).filter(Boolean))].sort();
      const comunidades = [...new Set(COMMUNITY_STATE.mensagensProcessadas.map(m => m.comunidade).filter(Boolean))].sort();

      populateMultiSelect('container-campanhas-comm', campanhas);
      populateMultiSelect('container-comunidades-comm', comunidades);
      
      const projSelect = document.getElementById('comm-project-filter');
      projSelect.innerHTML = '<option value="todos">Todos os Projetos</option>';
      projetos.forEach(p => {
        const opt = document.createElement('option'); opt.value = p; opt.textContent = p;
        projSelect.appendChild(opt);
      });
    }

    document.getElementById('comm-apply-filters').addEventListener('click', () => {
      COMMUNITY_STATE.pagination = {}; renderCommunityDashboard();
    });
    
    document.getElementById('comm-reset-filters').addEventListener('click', () => {
      document.getElementById('comm-project-filter').value = 'todos';
      document.getElementById('comm-limit-filter').value = '10';
      selectAllCampaigns(document.querySelector('#container-campanhas-comm .multi-select-item'));
      selectAllCampaigns(document.querySelector('#container-comunidades-comm .multi-select-item'));
      setCommunityDefaultDates(); 
      COMMUNITY_STATE.pagination = {}; renderCommunityDashboard();
    });

    async function loadCommunityData() {
      if (COMMUNITY_STATE.isLoaded) return; // Evita carregar duas vezes
      
      try {
        // DINÂMICO: chama a Cloudflare Function do projeto ativo (mesma origem, sem CORS)
        const res = await fetch(`/api/${PROJETO_ATIVO}/engajamento`);
        const data = await res.json();
        
        // Desempacota do Array se necessário
        let payload = Array.isArray(data) ? data[0] : data;
        
        // Desempacota do Nó "Respond to Webhook" do n8n se vier envelopado
        if (payload && payload.json) {
            payload = payload.json;
        }

        COMMUNITY_STATE.dashboardData = payload;
        COMMUNITY_STATE.mensagensProcessadas = payload.mensagens_processadas || [];
        COMMUNITY_STATE.isLoaded = true; // Marca como carregado
        
        populateCommunityFilters();
        setCommunityDefaultDates();
        renderCommunityDashboard();
        
        const footerElement = document.getElementById('footer-text');
        if (footerElement) footerElement.textContent = `Atualizado em ${formatDateTimeCommunity(COMMUNITY_STATE.dashboardData.carregado_em)}`;
      } catch (error) {
        console.error("Erro no Engajamento:", error);
        document.getElementById('comm-campaigns-container').innerHTML = `<div class="text-center py-10 text-rose-400">Erro ao comunicar com n8n.</div>`;
      }
    }

