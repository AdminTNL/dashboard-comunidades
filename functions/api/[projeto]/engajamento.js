import { getProjeto, dbProjetoNome } from '../../_lib/config.js';
import { getSupabaseClient } from '../../_lib/supabase.js';
import { jsonResponse, errorResponse } from '../../_lib/response.js';

// Equivalente ao ramal "Engajamento" do workflow n8n "Dados - HTML":
// Webhook -> Resolver Dashboard -> HTTP Request (get_dashboard_data) -> Montar Resposta Dashboard -> Respond
export async function onRequestGet({ params, env }) {
  const chave = (params.projeto || '').toLowerCase();
  const projeto = getProjeto(chave);
  if (!projeto) {
    return errorResponse(`Projeto não reconhecido: ${chave}`, 404);
  }

  let data;
  try {
    const supabase = getSupabaseClient(env);
    const rpc = await supabase.rpc('get_dashboard_data', { p_projeto: dbProjetoNome(projeto) });
    if (rpc.error) return errorResponse(rpc.error.message, 502);
    data = rpc.data;
  } catch (err) {
    return errorResponse(err.message, 500);
  }

  // Mesma transformação que o node "Montar Resposta Dashboard" fazia no n8n
  const mensagensProcessadas = (data || []).map((item) => ({
    ...item,
    total_reacoes: (item.reacoes || []).length,
    total_votos: (item.votos || []).length,
    total_engajamentos: (item.reacoes || []).length + (item.votos || []).length
  }));

  let globalReacoes = 0;
  let globalVotos = 0;
  mensagensProcessadas.forEach((m) => {
    globalReacoes += m.total_reacoes;
    globalVotos += m.total_votos;
  });

  return jsonResponse({
    dashboard: chave,
    nome_dashboard: `Comunidades ${projeto.nome}`,
    projeto: dbProjetoNome(projeto),
    carregado_em: new Date().toISOString(),
    totais: {
      mensagens: mensagensProcessadas.length,
      engajamentos: globalReacoes + globalVotos,
      reacoes_unicas_somadas: globalReacoes,
      votos_unicos_somados: globalVotos,
      mensagens_com_engajamento: mensagensProcessadas.filter((m) => m.total_engajamentos > 0).length
    },
    mensagens_processadas: mensagensProcessadas,
    campanhas_disponiveis: [...new Set(mensagensProcessadas.map((m) => m.campanha))].sort(),
    comunidades_disponiveis: [...new Set(mensagensProcessadas.map((m) => m.comunidade))].sort()
  });
}
