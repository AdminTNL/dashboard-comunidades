import { getSupabaseClient } from '../../_lib/supabase.js';
import { jsonResponse, errorResponse } from '../../_lib/response.js';

// Feature exclusiva de PA dentro da aba compartilhada "Engajamento":
// cruza quem votou nas enquetes (interacoes_v2) com a base de comissionados
// (pa_comissionados), usando a mesma normalize_telefone_br ja usada em
// get_movimentacao_detalhada para lidar com formatos de telefone diferentes.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');

  if (!start || !end) {
    return errorResponse('Parametros "start" e "end" (YYYY-MM-DD) sao obrigatorios.', 400);
  }

  try {
    const supabase = getSupabaseClient(env);
    const { data, error } = await supabase.rpc('get_pa_voto_ranking', {
      p_start: start,
      p_end: end
    });
    if (error) return errorResponse(error.message, 502);
    return jsonResponse(data);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
