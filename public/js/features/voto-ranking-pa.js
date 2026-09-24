    // =========================================================================
    // FEATURE: CRUZAMENTO DE VOTANTES x COMISSIONADOS - EXCLUSIVO PARÁ
    // Ver PADRAO-EXTENSAO-ABA-COMPARTILHADA.md
    // =========================================================================
    const VOTOPA_STATE = { lastRange: null, dados: null, loading: false };

    function votopaFormatDate(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    }

    function votopaRenderKpis(dados) {
      const secretariaTop = dados.ranking_secretarias[0];
      const pessoaTop = dados.ranking_pessoas[0];
      const kpis = [
        { title: 'Enquetes no Período', value: dados.totais.enquetes_no_periodo, icon: 'list-checks', color: 'blue' },
        { title: 'Participações Cruzadas', value: dados.totais.participacoes_cruzadas, icon: 'link-2', color: 'emerald' },
        { title: 'Secretaria Líder', value: secretariaTop ? secretariaTop.secretaria : '—', icon: 'building-2', color: 'amber', small: true },
        { title: 'Pessoa Líder', value: pessoaTop ? pessoaTop.nome : '—', icon: 'user-check', color: 'purple', small: true }
      ];
      document.getElementById('votopa-kpis-container').innerHTML = kpis.map(k => `
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-${k.color}-500 relative overflow-hidden">
          <div class="flex items-center gap-3 mb-2">
            <i data-lucide="${k.icon}" class="w-5 h-5 text-${k.color}-400"></i>
            <h3 class="text-sm font-medium text-slate-400">${k.title}</h3>
          </div>
          <p class="${k.small ? 'text-lg' : 'text-3xl'} font-bold text-slate-100 truncate" title="${escapeHtml(String(k.value))}">${escapeHtml(String(k.value))}</p>
        </div>
      `).join('');
      lucide.createIcons();
    }

    function votopaRenderSecretarias(ranking) {
      const tbody = document.getElementById('votopa-tabela-secretarias');
      if (!ranking.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-slate-500">Sem participações no período.</td></tr>';
        return;
      }
      tbody.innerHTML = ranking.map((r, i) => `
        <tr>
          <td class="py-2 px-2">${i + 1}º</td>
          <td class="py-2 px-2">${escapeHtml(r.secretaria || 'Não identificada')}</td>
          <td class="py-2 px-2 text-right font-semibold text-amber-400">${r.participacoes}</td>
          <td class="py-2 px-2 text-right">${r.pessoas_unicas}</td>
        </tr>
      `).join('');
    }

    function votopaRenderPessoas(ranking) {
      const limitSelect = document.getElementById('votopa-limite-pessoas');
      const limitValue = limitSelect.value;
      const limited = limitValue === 'all' ? ranking : ranking.slice(0, parseInt(limitValue, 10));

      const tbody = document.getElementById('votopa-tabela-pessoas');
      if (!limited.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-slate-500">Sem participações no período.</td></tr>';
        return;
      }
      tbody.innerHTML = limited.map((p, i) => `
        <tr>
          <td class="py-2 px-2">${i + 1}º</td>
          <td class="py-2 px-2">${escapeHtml(p.nome)}</td>
          <td class="py-2 px-2 text-slate-400">${escapeHtml(p.secretaria || 'Não identificada')}</td>
          <td class="py-2 px-2 text-right font-semibold text-amber-400">${p.participacoes}</td>
        </tr>
      `).join('');
    }

    function votopaToggleDetalhes(idMensagem) {
      const el = document.getElementById(`votopa-detalhes-${idMensagem}`);
      if (el) el.classList.toggle('hidden');
    }

    function votopaRenderEnquetes(enquetes) {
      const container = document.getElementById('votopa-lista-enquetes');
      if (!enquetes.length) {
        container.innerHTML = '<p class="text-sm text-slate-500 text-center py-6">Nenhuma enquete no período selecionado.</p>';
        return;
      }
      container.innerHTML = enquetes.map(enq => {
        const preview = (enq.texto_preview || '(Sem texto)').slice(0, 120);
        const participantes = enq.participantes || [];
        return `
          <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="text-xs text-slate-500">${votopaFormatDate(enq.data_envio)} · ${escapeHtml(enq.campanha || '')} · ${escapeHtml(enq.comunidade || '')}</p>
                <p class="text-sm text-slate-200 truncate" title="${escapeHtml(enq.texto_preview || '')}">${escapeHtml(preview)}${(enq.texto_preview || '').length > 120 ? '…' : ''}</p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20 font-bold">${enq.total_participantes} participação(ões)</span>
                <button onclick="votopaToggleDetalhes('${enq.id_mensagem}')" class="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 whitespace-nowrap">Ver detalhes</button>
              </div>
            </div>
            <div id="votopa-detalhes-${enq.id_mensagem}" class="hidden mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${participantes.length ? participantes.map(p => `
                <div class="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800">
                  <span class="text-xs text-slate-200 truncate">${escapeHtml(p.nome)}</span>
                  <span class="text-[10px] text-slate-500 uppercase">${escapeHtml(p.secretaria || '')}</span>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 col-span-2">Nenhum participante identificado.</p>'}
            </div>
          </div>
        `;
      }).join('');
    }

    function votopaRenderTudo() {
      if (!VOTOPA_STATE.dados) return;
      votopaRenderKpis(VOTOPA_STATE.dados);
      votopaRenderSecretarias(VOTOPA_STATE.dados.ranking_secretarias);
      votopaRenderPessoas(VOTOPA_STATE.dados.ranking_pessoas);
      votopaRenderEnquetes(VOTOPA_STATE.dados.enquetes);
    }

    async function votopaCarregar(start, end) {
      const rangeKey = `${start}|${end}`;
      if (VOTOPA_STATE.loading || VOTOPA_STATE.lastRange === rangeKey) {
        if (VOTOPA_STATE.dados) votopaRenderTudo();
        return;
      }
      VOTOPA_STATE.loading = true;
      const container = document.getElementById('votopa-lista-enquetes');
      if (container) container.innerHTML = '<p class="text-sm text-slate-500 text-center py-6 animate-pulse">Cruzando votantes com a base de comissionados...</p>';

      try {
        const res = await fetch(`/api/pa/voto-ranking?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Falha ao carregar o cruzamento.');

        VOTOPA_STATE.dados = data;
        VOTOPA_STATE.lastRange = rangeKey;
        votopaRenderTudo();
      } catch (err) {
        console.error('Erro no cruzamento de votantes PA:', err);
        if (container) container.innerHTML = `<p class="text-sm text-rose-400 text-center py-6">Erro ao carregar: ${escapeHtml(err.message)}</p>`;
      } finally {
        VOTOPA_STATE.loading = false;
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      const limitSelect = document.getElementById('votopa-limite-pessoas');
      if (limitSelect) {
        limitSelect.addEventListener('change', () => {
          if (VOTOPA_STATE.dados) votopaRenderPessoas(VOTOPA_STATE.dados.ranking_pessoas);
        });
      }
    });

    registerFeature('voto-ranking-pa', {
      render() {
        const startDate = document.getElementById('comm-start-date').value;
        const endDate = document.getElementById('comm-end-date').value;
        if (!startDate || !endDate) return;
        votopaCarregar(startDate, endDate);
      }
    });
