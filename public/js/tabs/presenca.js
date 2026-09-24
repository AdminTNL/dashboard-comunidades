    // =========================================================================
    // MÓDULO 3: ENCONTROS (EXCLUSIVO PERNAMBUCO)
    // =========================================================================
    const PRESENCA_STORE = { rawData: null, baseMembros: {}, meetings: {}, liderTotalBase: {} };

    function converterDataBR(dataStr) {
      if (!dataStr || !dataStr.includes('/')) return new Date(0);
      const partes = dataStr.split('/');
      return new Date(partes[2], partes[1] - 1, partes[0]);
    }

    function isQuartaFeira(dataStr) {
      const data = converterDataBR(dataStr);
      return data.getDay() === 3; 
    }

    async function loadPresencaData(force = false) {
      if (PROJETO_ATIVO !== 'pe') return; // Segurança extra
      if (PRESENCA_STATE.isLoaded && !force) return;
      const url = "https://script.google.com/macros/s/AKfycbytyUSMP01nsa5CGXaFJzqYoCJ79BD_EForqc8gaFMIruaxHSxQRjMijCkTxRClsqRhnw/exec";

      try {
        const container = document.getElementById('presenca-kpis-container');
        container.innerHTML = '<div class="col-span-full py-10 text-center text-slate-400 animate-pulse">Calculando taxas de ativação e base de líderes...</div>';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
          PRESENCA_STORE.liderTotalBase = {};
          const ignoreKeys = ['ok', 'generatedAt', 'spreadsheetId', 'presenca'];
          
          Object.keys(data).forEach(key => {
            if (!ignoreKeys.includes(key)) {
              data[key].forEach(m => {
                const tel = (m['Número formatado'] || '').toString().trim();
                const lider = (m['ind arrumado'] || 'Não informado').trim();
                
                if (tel) {
                  PRESENCA_STORE.baseMembros[tel] = {
                    nome: (m['Nome tratado'] || 'Participante').trim(),
                    lider: lider,
                    status: (m['Comunidade'] || '❌').trim()
                  };
                }

                if (lider !== 'Não informado' && lider !== 'Sem líder' && lider !== '') {
                  PRESENCA_STORE.liderTotalBase[lider] = (PRESENCA_STORE.liderTotalBase[lider] || 0) + 1;
                }
              });
            }
          });

          const meetings = {};
          data.presenca.forEach(p => {
            const tipo = (p['Reunião'] || 'MobilizaPE').trim();
            const dataFull = p['Data'] || '';
            const dataApenas = dataFull.split(' ')[0]; 
            
            if (dataApenas.length >= 8 && isQuartaFeira(dataApenas)) {
              if (!meetings[tipo]) meetings[tipo] = new Set();
              meetings[tipo].add(dataApenas);
            }
          });

          PRESENCA_STORE.meetings = meetings;
          PRESENCA_STORE.rawData = data.presenca;

          const tipoSelect = document.getElementById('presenca-tipo-filter');
          tipoSelect.innerHTML = Object.keys(meetings).map(t => `<option value="${t}">${t}</option>`).join('');
          
          atualizarDatasDisponiveis();
        }
      } catch (e) { console.error(e); }
    }

    function atualizarDatasDisponiveis() {
      const tipo = document.getElementById('presenca-tipo-filter').value;
      const datas = Array.from(PRESENCA_STORE.meetings[tipo] || [])
        .sort((a, b) => converterDataBR(b) - converterDataBR(a));
      
      const dataSelect = document.getElementById('presenca-data-filter');
      dataSelect.innerHTML = datas.map(d => `<option value="${d}">${d}</option>`).join('');
      
      PRESENCA_STATE.isLoaded = true;
      renderPresencaDashboard();
    }

    function renderPresencaDashboard() {
      const tipo = document.getElementById('presenca-tipo-filter').value;
      const dataSel = document.getElementById('presenca-data-filter').value;
      const allPresencas = PRESENCA_STORE.rawData || [];

      const presencasDoDia = allPresencas.filter(p => (p['Reunião'] || '').trim() === tipo && p['Data'].startsWith(dataSel));
      
      let comMatch = 0;
      const lideresPresenca = {};
      const listaParticipantes = [];
      const numerosVistos = new Set();

      presencasDoDia.forEach(p => {
        const tel = (p['Formatado'] || '').toString().trim();
        if (!tel || numerosVistos.has(tel)) return;
        numerosVistos.add(tel);

        const info = PRESENCA_STORE.baseMembros[tel];
        const temMatch = !!info;
        if (temMatch) comMatch++;

        const nome = temMatch ? info.nome : (p['Nome'] || 'Novo Cadastro');
        const lider = temMatch ? info.lider : 'Sem líder';
        const status = temMatch ? info.status : '❌';

        if (lider !== 'Sem líder' && lider !== 'Não informado' && lider !== '') {
          lideresPresenca[lider] = (lideresPresenca[lider] || 0) + 1;
        }
        
        listaParticipantes.push({ nome, tel, lider, status, temMatch });
      });

      document.getElementById('presenca-kpis-container').innerHTML = `
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500">
          <p class="text-xs text-slate-400 uppercase font-bold">Total na Reunião</p>
          <p class="text-3xl font-bold">${numerosVistos.size}</p>
        </div>
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <p class="text-xs text-slate-400 uppercase font-bold">Com Correspondência</p>
          <p class="text-3xl font-bold">${comMatch}</p>
        </div>
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
          <p class="text-xs text-slate-400 uppercase font-bold">Sem Match (Pendentes)</p>
          <p class="text-3xl font-bold">${numerosVistos.size - comMatch}</p>
        </div>
      `;

      renderGraficoLinha(allPresencas.filter(p => (p['Reunião'] || '').trim() === tipo));

      const rankingLideres = Object.entries(lideresPresenca).map(([nome, presentes]) => {
        const baseTotal = PRESENCA_STORE.liderTotalBase[nome] || presentes;
        const taxa = ((presentes / baseTotal) * 100).toFixed(1);
        return { nome, presentes, baseTotal, taxa: parseFloat(taxa) };
      }).sort((a, b) => b.presentes - a.presentes);

      document.getElementById('presenca-top3-lideres').innerHTML = rankingLideres.slice(0, 3).map((l, i) => `
        <div class="glass-panel p-4 rounded-xl border border-blue-500/10 relative overflow-hidden">
          <div class="absolute -right-2 -top-2 text-4xl font-black text-slate-500/10">${i+1}º</div>
          <p class="text-xs font-bold text-slate-200 truncate mb-1">${l.nome}</p>
          <div class="flex items-end justify-between">
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold">Ativação</p>
              <p class="text-xl font-black text-blue-400">${l.taxa}%</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-slate-500 uppercase font-bold">Presentes</p>
              <p class="text-sm font-bold text-slate-300">${l.presentes} / ${l.baseTotal}</p>
            </div>
          </div>
        </div>
      `).join('');

      document.getElementById('presenca-tabela-lideres').innerHTML = rankingLideres.map((l, i) => `
        <tr class="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
          <td class="py-3 text-slate-500 font-bold">${i+1}º</td>
          <td class="py-3 font-semibold text-slate-200">${l.nome}</td>
          <td class="py-3 text-center text-slate-300">${l.baseTotal}</td>
          <td class="py-3 text-center font-bold text-emerald-400">${l.presentes}</td>
          <td class="py-3 text-right font-black text-blue-400">${l.taxa}%</td>
        </tr>
      `).join('');

      document.getElementById('presenca-tabela-participantes').innerHTML = listaParticipantes.sort((a, b) => b.temMatch - a.temMatch).map(p => `
        <tr class="hover:bg-slate-800/30 transition-colors">
          <td class="py-3 px-2 text-center">${p.status}</td>
          <td class="py-3 px-2">
            <p class="font-bold text-slate-200">${escapeHtml(p.nome)}</p>
            <p class="text-[9px] ${p.temMatch ? 'text-emerald-500' : 'text-rose-500'} font-bold uppercase">${p.temMatch ? 'Na Base' : 'Não Cadastrado'}</p>
          </td>
          <td class="py-3 px-2 font-mono text-slate-400 text-[11px]">${p.tel}</td>
          <td class="py-3 px-2 text-blue-400 font-medium text-[11px]">${escapeHtml(p.lider)}</td>
        </tr>
      `).join('');

      lucide.createIcons();
    }

    function renderGraficoLinha(dadosFiltrados) {
      const vistasPorData = {};
      
      dadosFiltrados.forEach(p => {
        const d = p['Data'].split(' ')[0];
        const tel = (p['Formatado'] || '').toString().trim();
        
        if (d.length >= 8 && tel && isQuartaFeira(d)) {
          if (!vistasPorData[d]) vistasPorData[d] = new Set();
          vistasPorData[d].add(tel);
        }
      });

      const datasOrdenadas = Object.keys(vistasPorData).sort((a, b) => converterDataBR(a) - converterDataBR(b));
      const ctx = document.getElementById('presencaLineChart').getContext('2d');
      if (window.presencaChartInstance) window.presencaChartInstance.destroy();
      
      window.presencaChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: datasOrdenadas.map(d => d.substring(0, 5)), 
          datasets: [{
            label: 'Participantes Únicos',
            data: datasOrdenadas.map(d => vistasPorData[d].size),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            borderWidth: 3
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

    function renderFrequenciaPeriodo() {
      const dataInicio = document.getElementById('presenca-freq-inicio').value;
      const dataFim = document.getElementById('presenca-freq-fim').value;
      const tbody = document.getElementById('presenca-tabela-frequencia');

      if (!PRESENCA_STORE.rawData) {
        tbody.innerHTML = '<tr><td colspan="2" class="py-8 text-center text-rose-400 font-medium">Os dados dos encontros ainda não foram carregados.</td></tr>';
        return;
      }

      // Converte os inputs HTML (YYYY-MM-DD) para objetos Date para comparação
      const startObj = dataInicio ? new Date(dataInicio + 'T00:00:00') : new Date(0);
      const endObj = dataFim ? new Date(dataFim + 'T23:59:59') : new Date(8640000000000000);

      const frequenciaMap = {};

      // Varre todas as presenças em cache
      PRESENCA_STORE.rawData.forEach(p => {
        const dataStr = (p['Data'] || '').split(' ')[0]; // Extrai só o DD/MM/YYYY
        if (!dataStr || dataStr.length < 8) return;

        const dataEvento = converterDataBR(dataStr);

        // AJUSTE AQUI: Verifica se está no período E se o dia da semana é quarta-feira (3)
        if (dataEvento >= startObj && dataEvento <= endObj && dataEvento.getDay() === 3) {
          const tel = (p['Formatado'] || '').toString().trim();
          if (!tel) return;

          const info = PRESENCA_STORE.baseMembros[tel];
          const nome = info ? info.nome : (p['Nome'] || tel);

          if (!frequenciaMap[tel]) {
            // Inicializa com um Set para guardar apenas dias ÚNICOS
            frequenciaMap[tel] = { 
                nome: nome, 
                diasParticipados: new Set() 
            };
          }
          // Adiciona a string da data ao Set. Garante 1 encontro por quarta-feira.
          frequenciaMap[tel].diasParticipados.add(dataStr);
        }
      });

      // Na hora de gerar o ranking, a contagem é o tamanho (.size) do Set de cada pessoa
      const ranking = Object.values(frequenciaMap)
        .map(item => ({
            nome: item.nome,
            contagem: item.diasParticipados.size // Pega a quantidade de quartas-feiras únicas
        }))
        .sort((a, b) => b.contagem - a.contagem);

      if (ranking.length === 0) {
        // Mensagem de fallback atualizada para refletir o filtro de quartas-feiras
        tbody.innerHTML = '<tr><td colspan="2" class="py-8 text-center text-slate-500 font-medium">Nenhum participante encontrado neste período nas quartas-feiras.</td></tr>';
        return;
      }

      // Injeta na tabela
      tbody.innerHTML = ranking.map((item, index) => `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="py-3 px-4 font-bold text-slate-200 flex items-center gap-3">
            <span class="text-[10px] text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">${index + 1}º</span>
            ${escapeHtml(item.nome)}
          </td>
          <td class="py-3 px-4 text-right font-black text-blue-400 text-sm">
            ${item.contagem} <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">encontros</span>
          </td>
        </tr>
      `).join('');
      
      lucide.createIcons();
    }
