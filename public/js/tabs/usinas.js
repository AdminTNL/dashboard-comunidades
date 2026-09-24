    // =========================================================================
    // MÓDULO 4: USINAS (EXCLUSIVO PARÁ)
    // =========================================================================
    const USINAS_DATA_CONFIG = {
      webhookUrl: "/api/pa/usinas",
      requestTimeoutMs: 15000,
      useEmbeddedFallback: true
    };

    const EMBEDDED_SNAPSHOT = {"generated_at":"2026-04-08T23:06:38.881268+00:00","timezone":"America/Belem","projects":["Cabanagem","Icuí","Jurunas","Marituba","Terra Firme"],"daily_counts":[{"date":"2025-09-24","projeto":"Cabanagem","entries":1},{"date":"2025-09-24","projeto":"Icuí","entries":1},{"date":"2025-09-24","projeto":"Jurunas","entries":1},{"date":"2025-09-24","projeto":"Marituba","entries":1},{"date":"2025-09-25","projeto":"Cabanagem","entries":10},{"date":"2025-09-26","projeto":"Cabanagem","entries":11},{"date":"2025-09-27","projeto":"Cabanagem","entries":138},{"date":"2025-09-28","projeto":"Cabanagem","entries":4},{"date":"2025-09-29","projeto":"Cabanagem","entries":20},{"date":"2025-09-29","projeto":"Icuí","entries":2},{"date":"2025-09-29","projeto":"Marituba","entries":1},{"date":"2025-09-30","projeto":"Cabanagem","entries":13},{"date":"2025-09-30","projeto":"Icuí","entries":1},{"date":"2025-09-30","projeto":"Marituba","entries":1},{"date":"2025-09-30","projeto":"Terra Firme","entries":1},{"date":"2025-10-01","projeto":"Cabanagem","entries":6},{"date":"2025-10-02","projeto":"Cabanagem","entries":3},{"date":"2025-10-03","projeto":"Cabanagem","entries":2},{"date":"2025-10-04","projeto":"Cabanagem","entries":1},{"date":"2025-10-07","projeto":"Cabanagem","entries":2},{"date":"2025-10-09","projeto":"Cabanagem","entries":3},{"date":"2025-10-09","projeto":"Icuí","entries":2},{"date":"2025-10-09","projeto":"Jurunas","entries":1},{"date":"2025-10-09","projeto":"Marituba","entries":1},{"date":"2025-10-13","projeto":"Cabanagem","entries":1},{"date":"2025-10-14","projeto":"Icuí","entries":172},{"date":"2025-10-14","projeto":"Jurunas","entries":1},{"date":"2025-10-15","projeto":"Icuí","entries":3},{"date":"2025-10-17","projeto":"Cabanagem","entries":42},{"date":"2025-10-17","projeto":"Icuí","entries":11},{"date":"2025-10-18","projeto":"Icuí","entries":1},{"date":"2025-10-20","projeto":"Icuí","entries":2},{"date":"2025-10-21","projeto":"Cabanagem","entries":24},{"date":"2025-10-21","projeto":"Icuí","entries":4},{"date":"2025-10-22","projeto":"Cabanagem","entries":7},{"date":"2025-10-22","projeto":"Icuí","entries":3},{"date":"2025-10-23","projeto":"Icuí","entries":85},{"date":"2025-10-24","projeto":"Icuí","entries":8},{"date":"2025-10-25","projeto":"Icuí","entries":9},{"date":"2025-10-28","projeto":"Cabanagem","entries":1},{"date":"2025-10-28","projeto":"Icuí","entries":1},{"date":"2025-10-29","projeto":"Cabanagem","entries":1},{"date":"2025-10-29","projeto":"Icuí","entries":4},{"date":"2025-10-30","projeto":"Icuí","entries":66},{"date":"2025-10-31","projeto":"Icuí","entries":17},{"date":"2025-11-01","projeto":"Icuí","entries":3},{"date":"2025-11-02","projeto":"Icuí","entries":3},{"date":"2025-11-03","projeto":"Cabanagem","entries":9},{"date":"2025-11-03","projeto":"Icuí","entries":6},{"date":"2025-11-04","projeto":"Cabanagem","entries":3},{"date":"2025-11-04","projeto":"Icuí","entries":97},{"date":"2025-11-05","projeto":"Icuí","entries":14},{"date":"2025-11-07","projeto":"Icuí","entries":2},{"date":"2025-11-10","projeto":"Icuí","entries":2},{"date":"2025-11-11","projeto":"Icuí","entries":5},{"date":"2025-11-12","projeto":"Icuí","entries":3},{"date":"2025-11-13","projeto":"Icuí","entries":3},{"date":"2025-11-14","projeto":"Cabanagem","entries":221},{"date":"2025-11-14","projeto":"Icuí","entries":2},{"date":"2025-11-15","projeto":"Cabanagem","entries":8},{"date":"2025-11-16","projeto":"Cabanagem","entries":4},{"date":"2025-11-17","projeto":"Cabanagem","entries":16},{"date":"2025-11-17","projeto":"Jurunas","entries":1},{"date":"2025-11-18","projeto":"Cabanagem","entries":37},{"date":"2025-11-19","projeto":"Cabanagem","entries":9},{"date":"2025-11-19","projeto":"Icuí","entries":6},{"date":"2025-11-20","projeto":"Cabanagem","entries":3},{"date":"2025-11-20","projeto":"Icuí","entries":1},{"date":"2025-11-22","projeto":"Cabanagem","entries":1},{"date":"2025-11-22","projeto":"Icuí","entries":1},{"date":"2025-11-24","projeto":"Cabanagem","entries":1},{"date":"2025-11-25","projeto":"Cabanagem","entries":1},{"date":"2025-11-25","projeto":"Icuí","entries":1},{"date":"2025-11-26","projeto":"Cabanagem","entries":4},{"date":"2025-11-26","projeto":"Icuí","entries":20},{"date":"2025-11-27","projeto":"Icuí","entries":11},{"date":"2025-11-28","projeto":"Icuí","entries":70},{"date":"2025-11-28","projeto":"Marituba","entries":2},{"date":"2025-12-01","projeto":"Cabanagem","entries":21},{"date":"2025-12-01","projeto":"Icuí","entries":2},{"date":"2025-12-02","projeto":"Cabanagem","entries":16},{"date":"2025-12-02","projeto":"Icuí","entries":3},{"date":"2025-12-03","projeto":"Cabanagem","entries":1},{"date":"2025-12-04","projeto":"Icuí","entries":5},{"date":"2025-12-05","projeto":"Cabanagem","entries":1},{"date":"2025-12-08","projeto":"Cabanagem","entries":2},{"date":"2025-12-09","projeto":"Icuí","entries":2},{"date":"2025-12-10","projeto":"Icuí","entries":1},{"date":"2025-12-11","projeto":"Jurunas","entries":2},{"date":"2025-12-16","projeto":"Icuí","entries":32},{"date":"2025-12-16","projeto":"Jurunas","entries":52},{"date":"2025-12-17","projeto":"Jurunas","entries":11},{"date":"2025-12-18","projeto":"Cabanagem","entries":1},{"date":"2025-12-19","projeto":"Icuí","entries":1},{"date":"2025-12-22","projeto":"Icuí","entries":1},{"date":"2025-12-22","projeto":"Jurunas","entries":1},{"date":"2025-12-23","projeto":"Jurunas","entries":115},{"date":"2025-12-24","projeto":"Jurunas","entries":8},{"date":"2025-12-25","projeto":"Jurunas","entries":1},{"date":"2025-12-26","projeto":"Jurunas","entries":3},{"date":"2025-12-29","projeto":"Icuí","entries":1},{"date":"2025-12-29","projeto":"Jurunas","entries":2},{"date":"2025-12-30","projeto":"Jurunas","entries":1},{"date":"2026-01-02","projeto":"Jurunas","entries":3},{"date":"2026-01-04","projeto":"Jurunas","entries":1},{"date":"2026-01-05","projeto":"Jurunas","entries":114},{"date":"2026-01-06","projeto":"Icuí","entries":3},{"date":"2026-01-06","projeto":"Jurunas","entries":70},{"date":"2026-01-07","projeto":"Jurunas","entries":62},{"date":"2026-01-08","projeto":"Cabanagem","entries":4},{"date":"2026-01-08","projeto":"Jurunas","entries":10},{"date":"2026-01-09","projeto":"Jurunas","entries":9},{"date":"2026-01-12","projeto":"Cabanagem","entries":28},{"date":"2026-01-12","projeto":"Icuí","entries":17},{"date":"2026-01-13","projeto":"Cabanagem","entries":16},{"date":"2026-01-13","projeto":"Icuí","entries":12},{"date":"2026-01-14","projeto":"Cabanagem","entries":6},{"date":"2026-01-14","projeto":"Icuí","entries":2},{"date":"2026-01-14","projeto":"Jurunas","entries":22},{"date":"2026-01-15","projeto":"Cabanagem","entries":19},{"date":"2026-01-15","projeto":"Icuí","entries":116},{"date":"2026-01-16","projeto":"Icuí","entries":2},{"date":"2026-01-17","projeto":"Icuí","entries":1},{"date":"2026-01-19","projeto":"Cabanagem","entries":1},{"date":"2026-01-19","projeto":"Icuí","entries":35},{"date":"2026-01-19","projeto":"Jurunas","entries":42},{"date":"2026-01-20","projeto":"Cabanagem","entries":12},{"date":"2026-01-20","projeto":"Icuí","entries":10},{"date":"2026-01-21","projeto":"Jurunas","entries":332},{"date":"2026-01-22","projeto":"Icuí","entries":11},{"date":"2026-01-22","projeto":"Jurunas","entries":8},{"date":"2026-01-23","projeto":"Jurunas","entries":1},{"date":"2026-01-24","projeto":"Icuí","entries":35},{"date":"2026-01-26","projeto":"Icuí","entries":29},{"date":"2026-01-26","projeto":"Jurunas","entries":1},{"date":"2026-01-27","projeto":"Icuí","entries":4},{"date":"2026-01-28","projeto":"Icuí","entries":1},{"date":"2026-01-29","projeto":"Cabanagem","entries":29},{"date":"2026-01-29","projeto":"Icuí","entries":2},{"date":"2026-01-29","projeto":"Jurunas","entries":18},{"date":"2026-01-30","projeto":"Icuí","entries":1},{"date":"2026-01-31","projeto":"Icuí","entries":2},{"date":"2026-02-02","projeto":"Cabanagem","entries":35},{"date":"2026-02-02","projeto":"Icuí","entries":12},{"date":"2026-02-02","projeto":"Marituba","entries":1},{"date":"2026-02-03","projeto":"Cabanagem","entries":26},{"date":"2026-02-03","projeto":"Icuí","entries":19},{"date":"2026-02-03","projeto":"Jurunas","entries":56},{"date":"2026-02-03","projeto":"Marituba","entries":76},{"date":"2026-02-04","projeto":"Cabanagem","entries":67},{"date":"2026-02-04","projeto":"Icuí","entries":14},{"date":"2026-02-04","projeto":"Jurunas","entries":1},{"date":"2026-02-04","projeto":"Marituba","entries":32},{"date":"2026-02-05","projeto":"Cabanagem","entries":27},{"date":"2026-02-05","projeto":"Icuí","entries":11},{"date":"2026-02-05","projeto":"Jurunas","entries":194},{"date":"2026-02-05","projeto":"Marituba","entries":21},{"date":"2026-02-06","projeto":"Icuí","entries":4},{"date":"2026-02-06","projeto":"Jurunas","entries":13},{"date":"2026-02-06","projeto":"Marituba","entries":7},{"date":"2026-02-07","projeto":"Jurunas","entries":1},{"date":"2026-02-07","projeto":"Marituba","entries":2},{"date":"2026-02-08","projeto":"Marituba","entries":1},{"date":"2026-02-09","projeto":"Cabanagem","entries":16},{"date":"2026-02-09","projeto":"Icuí","entries":2},{"date":"2026-02-09","projeto":"Jurunas","entries":4},{"date":"2026-02-09","projeto":"Marituba","entries":4},{"date":"2026-02-09","projeto":"Terra Firme","entries":4},{"date":"2026-02-10","projeto":"Marituba","entries":43},{"date":"2026-02-10","projeto":"Terra Firme","entries":13},{"date":"2026-02-11","projeto":"Icuí","entries":1},{"date":"2026-02-11","projeto":"Jurunas","entries":7},{"date":"2026-02-11","projeto":"Marituba","entries":59},{"date":"2026-02-11","projeto":"Terra Firme","entries":2},{"date":"2026-02-12","projeto":"Cabanagem","entries":31},{"date":"2026-02-12","projeto":"Jurunas","entries":5},{"date":"2026-02-12","projeto":"Marituba","entries":5},{"date":"2026-02-12","projeto":"Terra Firme","entries":5},{"date":"2026-02-13","projeto":"Icuí","entries":4},{"date":"2026-02-13","projeto":"Jurunas","entries":1},{"date":"2026-02-13","projeto":"Marituba","entries":8},{"date":"2026-02-13","projeto":"Terra Firme","entries":1},{"date":"2026-02-14","projeto":"Marituba","entries":1},{"date":"2026-02-15","projeto":"Terra Firme","entries":1},{"date":"2026-02-16","projeto":"Marituba","entries":2},{"date":"2026-02-18","projeto":"Marituba","entries":1},{"date":"2026-02-18","projeto":"Terra Firme","entries":1},{"date":"2026-02-19","projeto":"Icuí","entries":1},{"date":"2026-02-20","projeto":"Marituba","entries":102},{"date":"2026-02-23","projeto":"Cabanagem","entries":66},{"date":"2026-02-23","projeto":"Icuí","entries":1},{"date":"2026-02-23","projeto":"Jurunas","entries":4},{"date":"2026-02-23","projeto":"Marituba","entries":11},{"date":"2026-02-23","projeto":"Terra Firme","entries":9},{"date":"2026-02-24","projeto":"Cabanagem","entries":11},{"date":"2026-02-24","projeto":"Icuí","entries":9},{"date":"2026-02-24","projeto":"Jurunas","entries":2},{"date":"2026-02-24","projeto":"Marituba","entries":75},{"date":"2026-02-24","projeto":"Terra Firme","entries":2},{"date":"2026-02-25","projeto":"Cabanagem","entries":56},{"date":"2026-02-25","projeto":"Icuí","entries":47},{"date":"2026-02-25","projeto":"Jurunas","entries":2},{"date":"2026-02-25","projeto":"Marituba","entries":6},{"date":"2026-02-25","projeto":"Terra Firme","entries":1},{"date":"2026-02-27","projeto":"Jurunas","entries":91},{"date":"2026-02-27","projeto":"Marituba","entries":22},{"date":"2026-02-27","projeto":"Terra Firme","entries":1},{"date":"2026-02-28","projeto":"Terra Firme","entries":6},{"date":"2026-03-02","projeto":"Cabanagem","entries":33},{"date":"2026-03-02","projeto":"Icuí","entries":82},{"date":"2026-03-02","projeto":"Jurunas","entries":1},{"date":"2026-03-02","projeto":"Marituba","entries":4},{"date":"2026-03-02","projeto":"Terra Firme","entries":3},{"date":"2026-03-03","projeto":"Terra Firme","entries":4},{"date":"2026-03-04","projeto":"Cabanagem","entries":27},{"date":"2026-03-04","projeto":"Icuí","entries":48},{"date":"2026-03-04","projeto":"Jurunas","entries":1},{"date":"2026-03-04","projeto":"Marituba","entries":5},{"date":"2026-03-04","projeto":"Terra Firme","entries":2},{"date":"2026-03-05","projeto":"Cabanagem","entries":27},{"date":"2026-03-05","projeto":"Icuí","entries":20},{"date":"2026-03-05","projeto":"Jurunas","entries":5},{"date":"2026-03-05","projeto":"Marituba","entries":21},{"date":"2026-03-05","projeto":"Terra Firme","entries":4},{"date":"2026-03-06","projeto":"Icuí","entries":2},{"date":"2026-03-06","projeto":"Jurunas","entries":2},{"date":"2026-03-06","projeto":"Terra Firme","entries":1},{"date":"2026-03-09","projeto":"Cabanagem","entries":1},{"date":"2026-03-09","projeto":"Marituba","entries":71},{"date":"2026-03-09","projeto":"Terra Firme","entries":10},{"date":"2026-03-10","projeto":"Terra Firme","entries":4},{"date":"2026-03-11","projeto":"Icuí","entries":1},{"date":"2026-03-11","projeto":"Jurunas","entries":15},{"date":"2026-03-11","projeto":"Marituba","entries":8},{"date":"2026-03-11","projeto":"Terra Firme","entries":8},{"date":"2026-03-12","projeto":"Marituba","entries":9},{"date":"2026-03-12","projeto":"Terra Firme","entries":10},{"date":"2026-03-13","projeto":"Icuí","entries":1},{"date":"2026-03-13","projeto":"Marituba","entries":4},{"date":"2026-03-13","projeto":"Terra Firme","entries":4},{"date":"2026-03-16","projeto":"Cabanagem","entries":2},{"date":"2026-03-16","projeto":"Icuí","entries":1},{"date":"2026-03-16","projeto":"Marituba","entries":1},{"date":"2026-03-16","projeto":"Terra Firme","entries":2},{"date":"2026-03-17","projeto":"Icuí","entries":1},{"date":"2026-03-17","projeto":"Marituba","entries":5},{"date":"2026-03-17","projeto":"Terra Firme","entries":2},{"date":"2026-03-18","projeto":"Icuí","entries":4},{"date":"2026-03-18","projeto":"Marituba","entries":10},{"date":"2026-03-18","projeto":"Terra Firme","entries":4},{"date":"2026-03-19","projeto":"Marituba","entries":2},{"date":"2026-03-19","projeto":"Terra Firme","entries":4},{"date":"2026-03-20","projeto":"Terra Firme","entries":1},{"date":"2026-03-21","projeto":"Terra Firme","entries":1},{"date":"2026-03-23","projeto":"Terra Firme","entries":5},{"date":"2026-03-24","projeto":"Icuí","entries":4},{"date":"2026-03-24","projeto":"Jurunas","entries":2},{"date":"2026-03-24","projeto":"Marituba","entries":12},{"date":"2026-03-24","projeto":"Terra Firme","entries":8},{"date":"2026-03-25","projeto":"Terra Firme","entries":1},{"date":"2026-03-26","projeto":"Terra Firme","entries":2},{"date":"2026-03-27","projeto":"Terra Firme","entries":1},{"date":"2026-03-28","projeto":"Terra Firme","entries":1},{"date":"2026-03-30","projeto":"Icuí","entries":47},{"date":"2026-03-30","projeto":"Marituba","entries":17},{"date":"2026-04-08","projeto":"Cabanagem","entries":3},{"date":"2026-04-08","projeto":"Icuí","entries":1},{"date":"2026-04-08","projeto":"Marituba","entries":1}]};

    function parseISODateLocal(dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0, 0);
    }

    function toISODate(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function formatDateBR(dateStr) { return new Intl.DateTimeFormat('pt-BR').format(parseISODateLocal(dateStr)); }
    function formatMonthBR(monthStr) { const [y, m] = monthStr.split('-').map(Number); return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1)); }
    function formatNumber(value) { return new Intl.NumberFormat('pt-BR').format(Number(value || 0)); }
    
    function getDateBounds() {
      const dates = USINAS_STATE.dataset.daily_counts.map(row => row.date).sort();
      return { min: dates[0], max: dates[dates.length - 1] };
    }

    function formatDateInputValue(value) {
      const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    function parseDateBRToISO(value) {
      const match = String(value || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return null;
      const [, dd, mm, yyyy] = match;
      const iso = `${yyyy}-${mm}-${dd}`;
      const parsed = parseISODateLocal(iso);
      if (Number.isNaN(parsed.getTime())) return null;
      if (toISODate(parsed) !== iso) return null;
      return iso;
    }

    function syncTextInputFromNative(nativeId, textId) {
      const nativeInput = $(nativeId); const textInput = $(textId);
      textInput.value = nativeInput.value ? formatDateBR(nativeInput.value) : '';
    }

    function applyTextDateValue(nativeId, textId) {
      const nativeInput = $(nativeId); const textInput = $(textId);
      textInput.value = formatDateInputValue(textInput.value);
      const iso = parseDateBRToISO(textInput.value);

      if (iso) { nativeInput.value = iso; textInput.value = formatDateBR(iso); } 
      else if (!textInput.value.trim()) { nativeInput.value = ''; } 
      else { syncTextInputFromNative(nativeId, textId); }

      renderUsinasDashboard();
    }

    function getSelectedRange() {
      const startInput = $('start-date');
      const endInput = $('end-date');
      return { 
        start: (startInput && startInput.value) ? startInput.value : null, 
        end: (endInput && endInput.value) ? endInput.value : null 
      }; 
    }
    
    function normalizeRange(range) {
      const bounds = getDateBounds();
      let start = range.start || bounds.min;
      let end = range.end || bounds.max;
      if (start > end) [start, end] = [end, start];
      return { start, end };
    }

    function getFilteredDaily() {
      const { start, end } = normalizeRange(getSelectedRange());
      return USINAS_STATE.dataset.daily_counts.filter(row => row.date >= start && row.date <= end);
    }

    function getProjects() { return [...USINAS_STATE.dataset.projects]; }
    
    function getProjectTotals(rows) {
      const totals = Object.fromEntries(getProjects().map(project => [project, 0]));
      rows.forEach(row => { totals[row.projeto] = (totals[row.projeto] || 0) + Number(row.entries || 0); });
      return totals;
    }

    function getTotalEntries(rows) { return rows.reduce((sum, row) => sum + Number(row.entries || 0), 0); }
    function getUniqueDates(rows) { return [...new Set(rows.map(row => row.date))].sort(); }
    
    function getWeekStart(dateStr) {
      const date = parseISODateLocal(dateStr);
      const day = (date.getDay() + 6) % 7; 
      date.setDate(date.getDate() - day);
      return toISODate(date);
    }

    function getWeekEndFromStart(weekStartStr) {
      const date = parseISODateLocal(weekStartStr);
      date.setDate(date.getDate() + 6);
      return toISODate(date);
    }

    function getMonthKey(dateStr) { return dateStr.slice(0, 7); }

    function buildWeeklyScoreRows(rows) {
      const weekProjectMap = new Map();
      rows.forEach(row => {
        const weekStart = getWeekStart(row.date);
        const key = `${weekStart}|${row.projeto}`;
        weekProjectMap.set(key, (weekProjectMap.get(key) || 0) + Number(row.entries || 0));
      });

      const weeklyMap = new Map();
      for (const project of getProjects()) { weeklyMap.set(project, { project, points: 0, entries: 0, weeks: 0 }); }

      const weeks = [...new Set(rows.map(row => getWeekStart(row.date)))].sort();
      weeks.forEach(weekStart => {
        const weekEntries = getProjects().map(project => { return { project, entries: weekProjectMap.get(`${weekStart}|${project}`) || 0 }; });
        const leader = Math.max(...weekEntries.map(item => item.entries), 0);
        weekEntries.forEach(item => {
          if (!item.entries || leader === 0) return;
          const points = Number(((item.entries / leader) * 100).toFixed(2));
          const current = weeklyMap.get(item.project);
          current.points += points; current.entries += item.entries; current.weeks += 1;
        });
      });

      return [...weeklyMap.values()].map(item => ({ ...item, points: Number(item.points.toFixed(2)) })).sort((a, b) => b.points - a.points || b.entries - a.entries || a.project.localeCompare(b.project));
    }

    function buildMonthlyScoreRows(rows, monthKey) {
      const datasetMaxDate = getDateBounds().max;
      const validWeekStarts = [...new Set(rows.map(row => getWeekStart(row.date)))]
        .filter(weekStart => getMonthKey(weekStart) === monthKey)
        .filter(weekStart => getWeekEndFromStart(weekStart) <= datasetMaxDate).sort();
      const monthlyRows = rows.filter(row => validWeekStarts.includes(getWeekStart(row.date)));
      return buildWeeklyScoreRows(monthlyRows);
    }

    function buildDailySeries(rows, project) {
      const filtered = rows.filter(row => row.projeto === project).sort((a, b) => a.date.localeCompare(b.date));
      const byDate = new Map(filtered.map(row => [row.date, Number(row.entries || 0)]));
      const allDates = getUniqueDates(rows);
      return allDates.map(date => ({ date, entries: byDate.get(date) || 0 }));
    }

    function getActiveMonthKey() {
      const { start } = normalizeRange(getSelectedRange());
      if ($('start-date').value) return start.slice(0, 7);
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    function getAnalyzedPeriodLabel() {
      const raw = getSelectedRange();
      const bounds = !raw.start && !raw.end ? getDateBounds() : normalizeRange(raw);
      return `Período analisado: ${formatDateBR(bounds.start || bounds.min)} a ${formatDateBR(bounds.end || bounds.max)}`;
    }

    function renderGlobalKpis(rows) {
      const totals = getProjectTotals(rows);
      const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      const leader = entries[0] || ['—', 0];
      const totalEntries = getTotalEntries(rows);
      const { start, end } = normalizeRange(getSelectedRange());
      const startDate = parseISODateLocal(start);
      const endDate = parseISODateLocal(end);
      const diffMs = endDate - startDate;
      const totalDays = Math.max(Math.floor(diffMs / 86400000) + 1, 1);
      const avgDaily = totalEntries / totalDays;
      
      const cards = [
        { title: 'Leads no período', value: formatNumber(totalEntries), detail: 'Somando todas as usinas', glow: 'glow-blue', icon: 'users' },
        { title: 'Usina líder', value: leader[0], detail: `${formatNumber(leader[1])} entrada(s)`, glow: 'glow-emerald', icon: 'trophy' },
        { title: 'Média diária', value: avgDaily.toFixed(1).replace('.', ','), detail: 'Entradas por dia no filtro', glow: 'glow-yellow', icon: 'activity' },
        { title: 'Usinas monitoradas', value: formatNumber(getProjects().length), detail: getProjects().join(' • '), glow: 'glow-purple', icon: 'factory' }
      ];

      $('global-kpis').innerHTML = cards.map(card => `
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

    function destroyChart(name) {
      if (USINAS_STATE.charts[name]) { USINAS_STATE.charts[name].destroy(); delete USINAS_STATE.charts[name]; }
    }

    function buildLineChart(canvasId, labels, data, label) {
      destroyChart(canvasId);
      const ctx = $(canvasId).getContext('2d');
      USINAS_STATE.charts[canvasId] = new Chart(ctx, {
        type: 'line', data: { labels, datasets: [{ label, data, borderWidth: 3, tension: 0.28, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } },
          scales: { x: { ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true }, grid: { color: 'rgba(148,163,184,0.08)' } },
            y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } } } }
      });
    }

    function buildBarChart(canvasId, labels, data, label) {
      destroyChart(canvasId);
      const ctx = $(canvasId).getContext('2d');
      USINAS_STATE.charts[canvasId] = new Chart(ctx, {
        type: 'bar', data: { labels, datasets: [{ label, data, borderWidth: 1 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } },
          scales: { x: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
            y: { ticks: { color: '#e2e8f0' }, grid: { display: false } } } }
      });
    }

    function renderOverviewChart(rows) {
      const totals = getProjectTotals(rows);
      const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      buildBarChart('chart-overview', entries.map(item => item[0]), entries.map(item => item[1]), 'Entradas');
    }

    function renderUsinaCards(rows) {
      const container = $('usina-cards');
      const totals = getProjectTotals(rows);
      container.innerHTML = getProjects().map((project, index) => `
        <div class="glass-panel rounded-3xl p-5 sm:p-6">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400 font-bold mb-2">Usina</p>
              <h3 class="text-xl font-bold text-white">${project}</h3>
              <p class="text-slate-300 text-sm mt-2">Leads no período: <span class="font-bold text-white mono">${formatNumber(totals[project] || 0)}</span></p>
            </div>
            <span class="badge badge-info">Série temporal</span>
          </div>
          <div class="h-[260px]"><canvas id="chart-usina-${index}"></canvas></div>
        </div>
      `).join('');

      getProjects().forEach((project, index) => {
        const series = buildDailySeries(rows, project);
        buildLineChart(`chart-usina-${index}`, series.map(item => formatDateBR(item.date)), series.map(item => item.entries), project);
      });
    }

    function renderScoreboard(rows) {
      const periodRanking = buildWeeklyScoreRows(rows);
      const activeMonth = getActiveMonthKey();
      const monthlyRanking = buildMonthlyScoreRows(USINAS_STATE.dataset.daily_counts, activeMonth);
      const generalRanking = buildWeeklyScoreRows(USINAS_STATE.dataset.daily_counts).map(item => ({ project: item.project, points: item.points, weeks: item.weeks }));

      USINAS_STATE.rankingPeriod = periodRanking; USINAS_STATE.rankingMonthly = monthlyRanking; USINAS_STATE.rankingGeneral = generalRanking; USINAS_STATE.activeMonth = activeMonth;

      $('period-badge').textContent = getAnalyzedPeriodLabel();
      $('monthly-badge').textContent = `Placar mensal: ${formatMonthBR(activeMonth)}`;

      buildBarChart('chart-scoreboard', periodRanking.map(item => item.project), periodRanking.map(item => item.points), 'Pontos');

      $('period-table-body').innerHTML = periodRanking.map((item, idx) => `<tr><td class="mono">${idx + 1}</td><td class="font-bold text-white">${item.project}</td><td class="mono">${item.points.toFixed(2).replace('.', ',')}</td><td class="mono">${formatNumber(item.entries)}</td></tr>`).join('') || `<tr><td colspan="4"><div class="p-4 text-slate-300">Sem dados no período.</div></td></tr>`;
      $('monthly-table-body').innerHTML = monthlyRanking.map((item, idx) => `<tr><td class="mono">${idx + 1}</td><td class="font-bold text-white">${item.project}</td><td class="mono">${item.points.toFixed(2).replace('.', ',')}</td><td class="mono">${formatNumber(item.entries)}</td></tr>`).join('') || `<tr><td colspan="4"><div class="p-4 text-slate-300">Sem dados para esse mês.</div></td></tr>`;
      $('general-table-body').innerHTML = generalRanking.map((item, idx) => `<tr><td class="mono">${idx + 1}</td><td class="font-bold text-white">${item.project}</td><td class="mono">${item.points.toFixed(2).replace('.', ',')}</td><td class="mono">${formatNumber(item.weeks)}</td></tr>`).join('') || `<tr><td colspan="4"><div class="p-4 text-slate-300">Sem dados disponíveis.</div></td></tr>`;
    }

    function renderUsinasDashboard() {
      const rows = getFilteredDaily();
      USINAS_STATE.filteredDaily = rows;
      
      // A linha "setAppliedPeriodLabel();" que causava o crash foi removida daqui!
      
      renderGlobalKpis(rows);
      renderOverviewChart(rows);
      renderUsinaCards(rows);
      renderScoreboard(rows);
      lucide.createIcons();
    }

    function applyPreset(preset) {
      const bounds = getDateBounds();
      const max = parseISODateLocal(bounds.max);
      let start = null; let end = bounds.max;

      if (preset === 'all') { start = ''; end = ''; } 
      else if (preset === 'month') { const now = new Date(); start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; } 
      else if (preset === '30d') { const startDate = new Date(max); startDate.setDate(startDate.getDate() - 29); start = toISODate(startDate); }

      $('start-date').value = start || ''; $('end-date').value = start ? end : '';
      renderUsinasDashboard();
      
      if (fpUsinasInstance) {
        if (start && end) fpUsinasInstance.setDate([parseISODateLocal(start), parseISODateLocal(end)]);
        else fpUsinasInstance.clear();
      }
    }

    function normalizeAggregatedPayload(payload) {
      if (!payload || typeof payload !== 'object') throw new Error('Payload inválido.');
      const dailyCounts = Array.isArray(payload.daily_counts) ? payload.daily_counts : [];
      const projects = Array.isArray(payload.projects) ? payload.projects : [];

      const normalizedRows = dailyCounts
        .map(row => ({ date: String(row.date || '').trim(), projeto: String(row.projeto || '').trim(), entries: Number(row.entries || 0) }))
        .filter(row => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && row.projeto && Number.isFinite(row.entries) && row.entries >= 0)
        .sort((a, b) => a.date.localeCompare(b.date) || a.projeto.localeCompare(b.projeto));

      const inferredProjects = normalizedRows.map(row => row.projeto);
      const finalProjects = [...new Set([...projects, ...inferredProjects].filter(Boolean))].sort((a, b) => a.localeCompare(b));

      return {
        generated_at: payload.generatedAt || payload.generated_at || new Date().toISOString(),
        timezone: payload.timezone || 'America/Belem', projects: finalProjects, daily_counts: normalizedRows
      };
    }

    async function loadUsinasDataset() {
      try {
        const res = await fetch(USINAS_DATA_CONFIG.webhookUrl);
        const data = await res.json();
        const payload = Array.isArray(data) ? data[0] : data;
        return normalizeAggregatedPayload(payload);
      } catch (error) {
        if (USINAS_DATA_CONFIG.useEmbeddedFallback) return EMBEDDED_SNAPSHOT;
        throw error;
      }
    }

    let fpUsinasInstance = null;

    function bindUsinasEvents() {
      // Instancia o Flatpickr no campo de texto
      fpUsinasInstance = flatpickr("#usinas-date-range", {
        mode: "range",
        dateFormat: "d/m/Y",
        locale: "pt",
        onChange: function(selectedDates, dateStr, instance) {
          if (selectedDates.length === 2) {
            // Quando seleciona início e fim, atualiza os inputs hidden (que o seu JS já usa)
            $('start-date').value = toISODate(selectedDates[0]);
            $('end-date').value = toISODate(selectedDates[1]);
            renderUsinasDashboard();
          } else if (selectedDates.length === 0) {
            $('start-date').value = '';
            $('end-date').value = '';
            renderUsinasDashboard();
          }
        }
      });

      $('reset-btn-usinas').addEventListener('click', () => {
        fpUsinasInstance.clear();
      });

      document.querySelectorAll('.preset-btn').forEach(btn => { 
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset)); 
      });
    }

    async function initUsinas() {
      if (PROJETO_ATIVO !== 'pa') return;
      if (USINAS_STATE.dataset) return; // já inicializado
      try {
        USINAS_STATE.dataset = await loadUsinasDataset();
        const bounds = getDateBounds();
        
        // Proteção: Só tenta setar o limite se o input existir no HTML
        if ($('start-date')) {
            $('start-date').min = bounds.min; $('start-date').max = bounds.max;
            $('end-date').min = bounds.min; $('end-date').max = bounds.max;
        }
        
        bindUsinasEvents();
        renderUsinasDashboard();
      } catch (error) { 
        console.error("Erro na aba Usinas:", error); 
      }
    }

    // =========================================================================
    // FUNÇÃO PARA EXPORTAR PLACAR DAS USINAS
    // =========================================================================
    function exportarGamificacao(btn) {
      // Muda o texto do botão para dar um feedback visual
      const textoOriginal = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Gerando...';
      lucide.createIcons();
      
      const area = document.getElementById('area-gamificacao');
      
      html2canvas(area, {
        scale: 2, // Isso dobra a resolução (ideal para enviar para clientes)
        backgroundColor: '#020617', // Mantém o fundo azul escuro do seu dashboard
        logging: false,
        useCORS: true
      }).then(canvas => {
        // Cria o link para baixar a imagem
        const link = document.createElement('a');
        const dataHoje = new Date().toISOString().slice(0,10);
        link.download = `Placar_Engaja_Para_${dataHoje}.png`; // Nome do arquivo
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Retorna o botão ao estado normal
        btn.innerHTML = textoOriginal;
        lucide.createIcons();
      }).catch(err => {
        console.error('Erro ao exportar:', err);
        alert('Ocorreu um erro ao gerar a imagem.');
        btn.innerHTML = textoOriginal;
        lucide.createIcons();
      });
    }
