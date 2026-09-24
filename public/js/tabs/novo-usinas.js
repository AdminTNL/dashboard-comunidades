    // MÓDULO 5: NOVO PLACAR USINAS (SALDO DE COMUNIDADES)
    // =========================================================================
    const PONTUACAO_HISTORICA = {
  "Icuí": 2977.32,
  "Cabanagem": 1825.76,
  "Jurunas/Condor": 1087.88,
  "Marituba": 976.09,
  "Terra Firme": 478.40
};

    const NOVO_USINAS_STATE = { dataset: null, filteredDaily: [], charts: {}, activeMonth: null };
    const NOVO_USINAS_WEBHOOK = "/api/pa/novo-usinas";

    function getNovoDateBounds() {
      if(!NOVO_USINAS_STATE.dataset || NOVO_USINAS_STATE.dataset.daily_counts.length === 0) return {min:'', max:''};
      const dates = NOVO_USINAS_STATE.dataset.daily_counts.map(row => row.date).sort();
      return { min: dates[0], max: dates[dates.length - 1] };
    }

    function getNovoSelectedRange() { 
      const startInput = $('novo-start-date');
      const endInput = $('novo-end-date');
      return { 
        start: (startInput && startInput.value) ? startInput.value : null, 
        end: (endInput && endInput.value) ? endInput.value : null 
      }; 
    }
    
    function normalizeNovoRange(range) {
      const bounds = getNovoDateBounds();
      let start = range.start || bounds.min;
      let end = range.end || bounds.max;
      if (start > end) [start, end] = [end, start];
      return { start, end };
    }

    function getNovoFilteredDaily() {
      const { start, end } = normalizeNovoRange(getNovoSelectedRange());
      return NOVO_USINAS_STATE.dataset.daily_counts.filter(row => row.date >= start && row.date <= end);
    }

    function getNovoProjects() { return [...NOVO_USINAS_STATE.dataset.projects]; }

    function buildNovoWeeklyScoreRows(rows) {
      const weekProjectMap = new Map();
      rows.forEach(row => {
        const weekStart = getWeekStart(row.date);
        const key = `${weekStart}|${row.projeto}`;
        if (!weekProjectMap.has(key)) weekProjectMap.set(key, {entradas: 0, saidas: 0});
        const st = weekProjectMap.get(key);
        st.entradas += Number(row.entradas || 0);
        st.saidas += Number(row.saidas || 0);
      });

      const weeklyMap = new Map();
      for (const project of getNovoProjects()) { 
          weeklyMap.set(project, { project, points: 0, saldoTotal: 0, entradas: 0, saidas: 0, weeks: 0 }); 
      }

      const weeks = [...new Set(rows.map(row => getWeekStart(row.date)))].sort();
      
      weeks.forEach(weekStart => {
        const weekSaldos = getNovoProjects().map(project => {
          const data = weekProjectMap.get(`${weekStart}|${project}`) || {entradas: 0, saidas: 0};
          const saldo = data.entradas - data.saidas;
          return { project, saldo: saldo > 0 ? saldo : 0, entradas: data.entradas, saidas: data.saidas };
        });

        const leaderSaldo = Math.max(...weekSaldos.map(item => item.saldo), 0);

        weekSaldos.forEach(item => {
          const current = weeklyMap.get(item.project);
          current.entradas += item.entradas;
          current.saidas += item.saidas;
          current.saldoTotal += (item.entradas - item.saidas);
          
          if (item.saldo > 0 && leaderSaldo > 0) {
             const points = Number(((item.saldo / leaderSaldo) * 100).toFixed(2));
             current.points += points;
          }
          if(item.entradas > 0 || item.saidas > 0) current.weeks += 1;
        });
      });

      return [...weeklyMap.values()]
        .map(item => ({ ...item, points: Number(item.points.toFixed(2)) }))
        .sort((a, b) => b.points - a.points || b.saldoTotal - a.saldoTotal || a.project.localeCompare(b.project));
    }

    function buildNovoMonthlyScoreRows(rows, monthKey) {
      const validRows = rows.filter(row => row.date.startsWith(monthKey));
      return buildNovoWeeklyScoreRows(validRows);
    }

    function renderNovoGlobalKpis(rows) {
      let totalEntradas = 0; let totalSaidas = 0;
      rows.forEach(r => { totalEntradas += r.entradas; totalSaidas += r.saidas; });
      const saldoAbsoluto = totalEntradas - totalSaidas;
      
      const cards = [
        { title: 'Saldo do Período', value: formatNumber(saldoAbsoluto), detail: 'Entradas - Saídas', glow: 'glow-blue', icon: 'activity' },
        { title: 'Entradas Totais', value: formatNumber(totalEntradas), detail: 'Pessoas que entraram', glow: 'glow-emerald', icon: 'user-plus' },
        { title: 'Saídas Totais', value: formatNumber(totalSaidas), detail: 'Pessoas que saíram', glow: 'glow-yellow', icon: 'user-minus' },
        { title: 'Usinas Monitoradas', value: formatNumber(getNovoProjects().length), detail: getNovoProjects().join(' • '), glow: 'glow-purple', icon: 'factory' }
      ];

      $('novo-global-kpis').innerHTML = cards.map(card => `
        <div class="glass-panel ${card.glow} rounded-3xl p-5 sm:p-6 min-h-[130px]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400 font-bold mb-3">${card.title}</p>
              <h3 class="text-2xl sm:text-3xl font-black text-white break-words">${card.value}</h3>
              <p class="text-sm text-slate-300 mt-3">${card.detail}</p>
            </div>
            <div class="w-11 h-11 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center shrink-0">
              <i data-lucide="${card.icon}" class="w-5 h-5 text-blue-300"></i>
            </div>
          </div>
        </div>
      `).join('');
    }

    function renderNovoOverviewChart(rows) {
      const totals = {};
      getNovoProjects().forEach(p => totals[p] = 0);
      rows.forEach(r => { totals[r.projeto] = (totals[r.projeto] || 0) + (r.entradas - r.saidas); });
      const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      
      if(USINAS_STATE.charts['novo-chart-overview']) USINAS_STATE.charts['novo-chart-overview'].destroy();
      const ctx = $('novo-chart-overview').getContext('2d');
      USINAS_STATE.charts['novo-chart-overview'] = new Chart(ctx, {
        type: 'bar', data: { labels: entries.map(e=>e[0]), datasets: [{ label: 'Saldo (Entradas - Saídas)', data: entries.map(e=>e[1]), borderWidth: 1, backgroundColor: '#34d399' }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }, y: { ticks: { color: '#e2e8f0' }, grid: { display: false } } } }
      });
    }

    function renderNovoScoreboard(rows) {
      const periodRanking = buildNovoWeeklyScoreRows(rows);
      
      let activeMonth = '';
      if ($('novo-start-date').value) activeMonth = $('novo-start-date').value.slice(0, 7);
      else activeMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      
      const monthlyRanking = buildNovoMonthlyScoreRows(NOVO_USINAS_STATE.dataset.daily_counts, activeMonth);
      
      const allTimeBase = buildNovoWeeklyScoreRows(NOVO_USINAS_STATE.dataset.daily_counts);
      const generalRanking = allTimeBase.map(item => {
         const historical = PONTUACAO_HISTORICA[item.project] || 0;
         return {
            project: item.project,
            points: item.points + historical,
            saldo: item.saldoTotal
         };
      }).sort((a, b) => b.points - a.points);

      if(USINAS_STATE.charts['novo-chart-scoreboard']) USINAS_STATE.charts['novo-chart-scoreboard'].destroy();
      const ctx = $('novo-chart-scoreboard').getContext('2d');
      USINAS_STATE.charts['novo-chart-scoreboard'] = new Chart(ctx, {
        type: 'bar', data: { labels: periodRanking.map(item => item.project), datasets: [{ label: 'Pontos', data: periodRanking.map(item => item.points), backgroundColor: '#a855f7' }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display:false } },
          scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }, y: { ticks: { color: '#e2e8f0' }, grid: { display: false } } } }
      });

      $('novo-period-table-body').innerHTML = periodRanking.map((item, idx) => `<tr><td class="mono">${idx + 1}</td><td class="font-bold text-white">${item.project}</td><td class="mono">${item.points.toFixed(2).replace('.', ',')}</td><td class="mono">${formatNumber(item.saldoTotal)}</td></tr>`).join('') || `<tr><td colspan="4"><div class="p-4 text-slate-300">Sem dados.</div></td></tr>`;
      $('novo-monthly-table-body').innerHTML = monthlyRanking.map((item, idx) => `<tr><td class="mono">${idx + 1}</td><td class="font-bold text-white">${item.project}</td><td class="mono">${item.points.toFixed(2).replace('.', ',')}</td><td class="mono">${formatNumber(item.saldoTotal)}</td></tr>`).join('') || `<tr><td colspan="4"><div class="p-4 text-slate-300">Sem dados.</div></td></tr>`;
      $('novo-general-table-body').innerHTML = generalRanking.map((item, idx) => `<tr><td class="mono">${idx + 1}</td><td class="font-bold text-emerald-400">${item.project}</td><td class="mono text-white font-bold">${item.points.toFixed(2).replace('.', ',')}</td><td class="mono">${formatNumber(item.saldo)}</td></tr>`).join('') || `<tr><td colspan="4"><div class="p-4 text-slate-300">Sem dados.</div></td></tr>`;
    }

    function renderNovoUsinasDashboard() {
      if(!NOVO_USINAS_STATE.dataset) return;
      const rows = getNovoFilteredDaily();
      
      // O bloco que procurava o $('novo-applied-period') foi removido daqui!

      renderNovoGlobalKpis(rows);
      renderNovoOverviewChart(rows);
      renderNovoScoreboard(rows);
      lucide.createIcons();
    }

    function normalizeNovoPayload(payload) {
      let dailyCounts = [];
      if (Array.isArray(payload) && payload.length > 0 && payload[0].projeto) { dailyCounts = payload; } 
      else if (Array.isArray(payload) && payload.length > 0 && payload[0].daily_counts) { dailyCounts = payload[0].daily_counts; }
      else if (payload && Array.isArray(payload.daily_counts)) { dailyCounts = payload.daily_counts; }

      const normalizedRows = dailyCounts
        .map(row => ({ date: String(row.date || '').trim(), projeto: String(row.projeto || '').trim(), entradas: Number(row.entradas || 0), saidas: Number(row.saidas || 0) }))
        .filter(row => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && row.projeto);

      const projects = [...new Set(normalizedRows.map(row => row.projeto).filter(Boolean))].sort();
      return { projects: projects, daily_counts: normalizedRows };
    }

    async function initNovoUsinas() {
      if (PROJETO_ATIVO !== 'pa') return;
      if (NOVO_USINAS_STATE.dataset) return; 
      
      try {
        const res = await fetch(NOVO_USINAS_WEBHOOK);
        const data = await res.json();
        NOVO_USINAS_STATE.dataset = normalizeNovoPayload(data);
        
        const bounds = getNovoDateBounds();
        
        // Proteção: Só tenta setar o limite se o input existir no HTML
        if(bounds.min && $('novo-start-date')) {
            $('novo-start-date').min = bounds.min; $('novo-start-date').max = bounds.max;
            $('novo-end-date').min = bounds.min; $('novo-end-date').max = bounds.max;
        }

        let fpNovoUsinasInstance = flatpickr("#novo-usinas-date-range", {
          mode: "range",
          dateFormat: "d/m/Y",
          locale: "pt",
          onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
              if($('novo-start-date')) $('novo-start-date').value = toISODate(selectedDates[0]);
              if($('novo-end-date')) $('novo-end-date').value = toISODate(selectedDates[1]);
              renderNovoUsinasDashboard();
            } else if (selectedDates.length === 0) {
              if($('novo-start-date')) $('novo-start-date').value = ''; 
              if($('novo-end-date')) $('novo-end-date').value = '';
              renderNovoUsinasDashboard();
            }
          }
        });

        const btnReset = $('novo-reset-btn');
        if(btnReset) btnReset.addEventListener('click', () => { fpNovoUsinasInstance.clear(); });

        document.querySelectorAll('.novo-preset-btn').forEach(btn => {
          btn.addEventListener('click', () => {
             const b = getNovoDateBounds();
             const max = parseISODateLocal(b.max);
             let s = null; let e = b.max;
             const preset = btn.dataset.preset;
             
             if (preset === 'all') { s = ''; e = ''; } 
             else if (preset === 'month') { const now = new Date(); s = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; } 
             else if (preset === '30d') { const stDate = new Date(max); stDate.setDate(stDate.getDate() - 29); s = toISODate(stDate); }
             
             if($('novo-start-date')) $('novo-start-date').value = s || ''; 
             if($('novo-end-date')) $('novo-end-date').value = s ? e : '';
             
             if (s && e) fpNovoUsinasInstance.setDate([parseISODateLocal(s), parseISODateLocal(e)]);
             else fpNovoUsinasInstance.clear();
             
             renderNovoUsinasDashboard();
          });
        });

        // Força a primeira renderização
        renderNovoUsinasDashboard();
      } catch (error) { 
          console.error("Erro no Novo Placar Usinas:", error); 
          const kpis = $('novo-global-kpis');
          if(kpis) kpis.innerHTML = '<p class="text-rose-500">Erro ao comunicar com n8n (Novo Placar).</p>';
      }
    }

    function exportarNovoGamificacao(btn) {
      const textoOriginal = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Gerando...';
      lucide.createIcons();
      
      html2canvas(document.getElementById('area-novo-gamificacao'), { scale: 2, backgroundColor: '#020617', useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Novo_Placar_Usinas_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.innerHTML = textoOriginal; lucide.createIcons();
      }).catch(err => { alert('Erro ao exportar'); btn.innerHTML = textoOriginal; lucide.createIcons(); });
    }
