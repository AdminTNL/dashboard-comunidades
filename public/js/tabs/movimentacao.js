    // =========================================================================
    // MÓDULO 2: MOVIMENTAÇÃO DA BASE - COMPARTILHADO
    // =========================================================================
    async function loadMovimentacaoData() {
      if (MOVIMENTACAO_STATE.isLoaded) return; 
      try {
        document.getElementById('mov-kpis-container').innerHTML = '<p class="text-slate-400 text-sm">Buscando histórico...</p>';
        // DINÂMICO: chama a Cloudflare Function do projeto ativo (mesma origem, sem CORS)
        const res = await fetch(`/api/${PROJETO_ATIVO}/movimentacao`);
        const data = await res.json();
        
        let payload = Array.isArray(data) ? data[0] : data;
        if(payload.get_movimentacao_detalhada) payload = payload.get_movimentacao_detalhada;
        
        MOVIMENTACAO_STATE.data = payload;
        MOVIMENTACAO_STATE.isLoaded = true;

        populateMovimentacaoFilters();
        setMovimentacaoDefaultDates();
        renderMovimentacaoDashboard();
      } catch (error) {
        document.getElementById('mov-kpis-container').innerHTML = '<p class="text-rose-400 text-sm">Erro ao carregar dados de movimentação.</p>';
      }
    }

    function populateMovimentacaoFilters() {
      const logs = MOVIMENTACAO_STATE.data.logs_brutos || [];
      const campanhas = [...new Set(logs.map(m => m.campanha).filter(Boolean))].sort();
      const comunidades = [...new Set(logs.map(m => m.comunidade).filter(Boolean))].sort();
      
      // Extrai os líderes caso o payload traga a chave "indicacao"
      const lideres = [...new Set(logs.map(m => m.indicacao).filter(Boolean))].sort();
    
      populateMultiSelect('container-campanhas-mov', campanhas);
      populateMultiSelect('container-comunidades-mov', comunidades);
      
      // Exibe o filtro de líderes se houver dados, senão mantém oculto
      const liderancaContainer = document.getElementById('filtro-lideranca-container');
      if (liderancaContainer) {
        if (lideres.length > 0) {
          liderancaContainer.classList.remove('hidden');
          populateMultiSelect('container-lideres-mov', lideres);
        } else {
          liderancaContainer.classList.add('hidden');
        }
      }
    }

    let fpMovStart = null;
    let fpMovEnd = null;

    function setMovimentacaoDefaultDates() {
      const logs = MOVIMENTACAO_STATE.data.logs_brutos || [];
      if (!logs || logs.length === 0) return;
      
      const timestamps = logs.map(m => new Date(m.data_evento).getTime()).filter(t => !isNaN(t));
      if (timestamps.length === 0) return;

      const absoluteMin = new Date(Math.min(...timestamps));
      const maxDate = new Date(Math.max(...timestamps));

      // 1. Configura a Data Final (Último dia registrado, forçando 23:59:59)
      const end7Days = new Date(maxDate);
      end7Days.setHours(23, 59, 59, 999);

      // 2. Configura a Data Inicial (Subtrai 6 dias para dar 7 dias totais, forçando 00:00:00)
      const start7Days = new Date(maxDate);
      start7Days.setDate(start7Days.getDate() - 6);
      start7Days.setHours(0, 0, 0, 0);

      // Helper para montar data ISO preservando fuso horário local
      const pad = (n) => String(n).padStart(2, '0');
      const toLocalISO = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds() || 0)}`;

      // Atualiza os inputs ocultos que o motor de busca usa
      $('mov-start-date').value = toLocalISO(start7Days);
      $('mov-end-date').value = toLocalISO(end7Days);

      // Atualiza o texto visual de histórico detectado para manter a transparência de tudo que tem no banco
      const label = document.getElementById('mov-history-range-label');
      if (label) label.textContent = `Histórico Localizado: ${absoluteMin.toLocaleDateString('pt-BR')} até ${maxDate.toLocaleDateString('pt-BR')}`;

      // 3. Configura o Calendário de INÍCIO (Sempre abre nos 7 dias atrás às 00:00)
      if (!fpMovStart) {
        fpMovStart = flatpickr("#mov-start-date-visible", {
          enableTime: true,
          time_24hr: true,
          dateFormat: "d/m/Y H:i",
          defaultDate: start7Days,
          defaultHour: 0,
          defaultMinute: 0,
          locale: "pt",
          onChange: function(selectedDates) {
            if (selectedDates.length > 0) {
              const d = selectedDates[0];
              d.setSeconds(0); // Garante o primeiro segundo do minuto escolhido
              $('mov-start-date').value = toLocalISO(d);
            } else {
              $('mov-start-date').value = '';
            }
          }
        });
      } else {
         fpMovStart.setDate(start7Days);
      }

      // 4. Configura o Calendário de FIM (Sempre abre no último dia às 23:59)
      if (!fpMovEnd) {
        fpMovEnd = flatpickr("#mov-end-date-visible", {
          enableTime: true,
          time_24hr: true,
          dateFormat: "d/m/Y H:i",
          defaultDate: end7Days,
          defaultHour: 23,
          defaultMinute: 59,
          locale: "pt",
          onChange: function(selectedDates) {
            if (selectedDates.length > 0) {
              const d = selectedDates[0];
              d.setSeconds(59); // Garante o último segundo do minuto escolhido
              $('mov-end-date').value = toLocalISO(d);
            } else {
              $('mov-end-date').value = '';
            }
          }
        });
      } else {
         fpMovEnd.setDate(end7Days);
      }
    }

    document.getElementById('mov-apply-filters').addEventListener('click', renderMovimentacaoDashboard);
    
    document.getElementById('mov-reset-filters').addEventListener('click', () => {
      document.getElementById('mov-project-filter').value = 'todos';
      selectAllCampaigns(document.querySelector('#container-campanhas-mov .multi-select-item'));
      selectAllCampaigns(document.querySelector('#container-comunidades-mov .multi-select-item'));
      const btnLideres = document.querySelector('#container-lideres-mov .multi-select-item');
      if (btnLideres) selectAllCampaigns(btnLideres);
      
      // Limpa as instâncias duplas
      if (fpMovStart) { fpMovStart.destroy(); fpMovStart = null; }
      if (fpMovEnd) { fpMovEnd.destroy(); fpMovEnd = null; }
      
      setMovimentacaoDefaultDates(); 
      renderMovimentacaoDashboard();
    });

    function renderMovimentacaoDashboard() {
      const data = MOVIMENTACAO_STATE.data;
      if (!data || !data.logs_brutos) return;

      const projectFilter = document.getElementById('mov-project-filter').value;
      const selectedCampaigns = getSelectedCampaigns('container-campanhas-mov');
      const selectedComunidades = getSelectedCampaigns('container-comunidades-mov');
      const selectedLideres = getSelectedCampaigns('container-lideres-mov'); 
      
      const startDateStr = document.getElementById('mov-start-date').value;
      const endDateStr = document.getElementById('mov-end-date').value;
      
      // Converte as datas exatas (com horas) para comparação
      const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
      const endDate = endDateStr ? new Date(endDateStr) : new Date('2999-12-31T23:59:59');

      const allLogs = [...data.logs_brutos].sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento));
      
      let runningTotal = 0; 
      
      // 1. Filtra primeiro apenas por Projeto/Campanha (Para calcular o acumulado de fundo perfeitamente)
      const baseFilteredLogs = allLogs.filter(log => {
          if (projectFilter !== 'todos' && log.projeto !== projectFilter) return false;
          if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(log.campanha)) return false;
          if (selectedComunidades.length > 0 && !selectedComunidades.includes(log.comunidade)) return false;
          if (selectedLideres.length > 0 && !selectedLideres.includes(log.indicacao)) return false;
          return true;
      });

      const dailyStats = {};
      baseFilteredLogs.forEach(log => {
          const dateStr = (log.data_evento || '').split('T')[0]; // Agrupador diário (apenas pro gráfico de barras)
          if(!dateStr) return;
          
          if (!dailyStats[dateStr]) dailyStats[dateStr] = { dia: dateStr, entradas: 0, saidas: 0 };
          
          if (log.acao === 'entrada') { dailyStats[dateStr].entradas++; runningTotal++; } 
          else if (log.acao === 'saida') { dailyStats[dateStr].saidas++; runningTotal--; }
          
          dailyStats[dateStr].saldo_diario = dailyStats[dateStr].entradas - dailyStats[dateStr].saidas;
          dailyStats[dateStr].total_acumulado = runningTotal; 
      });

      // 2. Agora aplica o filtro de TEMPO cirúrgico em cima da base 
      let entradasPeriodo = 0; 
      let saidasPeriodo = 0;
      
      const timeFilteredLogs = baseFilteredLogs.filter(log => {
          const logDate = new Date(log.data_evento);
          if (logDate >= startDate && logDate <= endDate) {
              if (log.acao === 'entrada') entradasPeriodo++;
              if (log.acao === 'saida') saidasPeriodo++;
              return true;
          }
          return false;
      });

      // Para o gráfico, mostramos os dias que "tocam" no período
      const startDayOnly = startDateStr ? startDateStr.split('T')[0] : '';
      const endDayOnly = endDateStr ? endDateStr.split('T')[0] : '';
      
      let historicoFiltrado = Object.values(dailyStats).filter(stat => {
          if (startDayOnly && stat.dia < startDayOnly) return false;
          if (endDayOnly && stat.dia > endDayOnly) return false;
          return true;
      }).sort((a, b) => a.dia.localeCompare(b.dia));

      const saldoPeriodo = entradasPeriodo - saidasPeriodo;

      const kpisHtml = [
        { title: 'Entradas no Período', val: entradasPeriodo, icon: 'user-plus', color: 'emerald' },
        { title: 'Saídas no Período', val: saidasPeriodo, icon: 'user-minus', color: 'rose' },
        { title: 'Saldo do Período', val: saldoPeriodo, icon: 'activity', color: 'blue' }
      ];

      document.getElementById('mov-kpis-container').innerHTML = kpisHtml.map(k => `
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-${k.color}-500 relative overflow-hidden">
          <div class="flex items-center gap-3 mb-2">
            <i data-lucide="${k.icon}" class="w-5 h-5 text-${k.color}-400"></i>
            <h3 class="text-sm font-medium text-slate-400">${k.title}</h3>
          </div>
          <p class="text-3xl font-bold text-slate-100">${k.val}</p>
        </div>
      `).join('');
      
      lucide.createIcons();

      const labels = historicoFiltrado.map(d => d.dia.split('-').reverse().slice(0,2).join('/'));
      const ctx = document.getElementById('movimentacaoChart').getContext('2d');
      if (movChartInstance) movChartInstance.destroy();

      movChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { type: 'line', label: 'Saldo', data: historicoFiltrado.map(d => d.saldo_diario), borderColor: '#3b82f6', borderWidth: 2, pointRadius: 4, tension: 0.3, yAxisID: 'y' },
            { type: 'bar', label: 'Entradas', data: historicoFiltrado.map(d => d.entradas), backgroundColor: 'rgba(52, 211, 153, 0.8)', borderRadius: 4, yAxisID: 'y' },
            { type: 'bar', label: 'Saídas', data: historicoFiltrado.map(d => -d.saidas), backgroundColor: 'rgba(244, 63, 94, 0.8)', borderRadius: 4, yAxisID: 'y' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
          plugins: { legend: { labels: { color: '#cbd5e1' } }, tooltip: { callbacks: { label: function(c) { let l = c.dataset.label||''; let v = c.parsed.y; if(l==='Saídas') v = Math.abs(v); return `${l}: ${v}`; } } } },
          scales: { x: { stacked: true, grid: { display: false }, ticks: { color: '#64748b' } }, y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } } }
        }
      });

      // As listas de quem entrou e saiu agora usam a timeFilteredLogs (que reflete o horário exato)
      const listEntradas = timeFilteredLogs.filter(l => l.acao === 'entrada').reverse();
      const listSaidas = timeFilteredLogs.filter(l => l.acao === 'saida').reverse();

      const renderPerson = (p, cor) => {
        const nomeExibido = p.telefone && p.nome_participante
          ? `${p.telefone} - ${p.nome_participante}`
          : (p.nome_participante || p.telefone || 'Participante');
          
        const iniciais = (p.nome_participante || p.telefone || 'P').substring(0, 2).toUpperCase();
        const foneDigits = String(p.telefone || '').replace(/\D/g, '');
        const waLink = foneDigits ? `https://wa.me/${foneDigits}` : '';
        
        const indicacaoHtml = p.indicacao
          ? `<p class="text-[10px] text-${cor}-400/80 truncate font-medium mt-0.5">Indicado por ${escapeHtml(p.indicacao)}</p>`
          : '';
          
        const conteudo = `
          <div class="w-8 h-8 rounded-full bg-${cor}-500/10 flex items-center justify-center text-${cor}-400 text-[10px] font-bold shrink-0">
            ${escapeHtml(iniciais)}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-200 truncate">${escapeHtml(nomeExibido)}</p>
            <p class="text-[10px] text-slate-500 truncate">${escapeHtml(p.campanha || '')}</p>
            ${indicacaoHtml}
          </div>
          <div class="text-[10px] text-slate-500 whitespace-nowrap self-start">${formatDateTimeCommunity(p.data_evento).split(' às ')[1] || formatDateTimeCommunity(p.data_evento)}</div>
        `;
        
        return waLink
          ? `<a href="${waLink}" target="_blank" rel="noopener" class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-lg border border-slate-800 hover:border-${cor}-500/40 hover:bg-slate-900/70 transition-colors">${conteudo}</a>`
          : `<div class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-lg border border-slate-800">${conteudo}</div>`;
      };

      document.getElementById('mov-list-entradas').innerHTML = listEntradas.length > 0 ? listEntradas.map(p => renderPerson(p, 'emerald')).join('') : '<p class="text-xs text-slate-500 py-2">Nenhuma entrada neste período.</p>';
      document.getElementById('mov-list-saidas').innerHTML = listSaidas.length > 0 ? listSaidas.map(p => renderPerson(p, 'rose')).join('') : '<p class="text-xs text-slate-500 py-2">Nenhuma saída neste período.</p>';
      
      const comunidadesInfo = data.comunidades_info || []; 
      const comunidadesFiltradas = comunidadesInfo.filter(c => {
        if (projectFilter !== 'todos' && c.projeto && c.projeto !== projectFilter) return false;
        if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(c.campanha)) return false;
        if (selectedComunidades.length > 0 && !selectedComunidades.includes(c.nome)) return false;
        return true;
      });

      const totalGeralParticipantes = comunidadesFiltradas.reduce((acc, curr) => acc + Number(curr.total_participantes || 0), 0);
      document.getElementById('mov-total-geral-participantes').textContent = totalGeralParticipantes.toLocaleString('pt-BR');

      const comunidadesOrdenadas = comunidadesFiltradas.sort((a, b) => Number(b.total_participantes) - Number(a.total_participantes));

      document.getElementById('mov-tabela-participantes-comunidade').innerHTML = comunidadesOrdenadas.length > 0 
        ? comunidadesOrdenadas.map(c => `
            <tr class="hover:bg-slate-800/40 transition-colors">
              <td class="py-3 px-4 font-bold text-slate-200">${escapeHtml(c.nome)}</td>
              <td class="py-3 px-4 text-slate-500 text-[10px] uppercase font-semibold">${escapeHtml(c.campanha || '-')}</td>
              <td class="py-3 px-4 text-right font-black text-blue-400 text-sm">${Number(c.total_participantes || 0).toLocaleString('pt-BR')}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="3" class="py-6 text-center text-slate-500 font-medium">Nenhum dado encontrado para os filtros atuais.</td></tr>`;
      
      lucide.createIcons();
    }

