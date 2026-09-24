import { getProjeto, dbProjetoNome } from '../../_lib/config.js';
import { getSupabaseClient } from '../../_lib/supabase.js';
import { jsonResponse, errorResponse } from '../../_lib/response.js';

// Equivalente ao ramal "Movimentação" do workflow n8n "Dados - HTML":
// Webhook1 -> Resolver Dashboard1 -> HTTP Request1 (get_movimentacao_detalhada) -> Respond
// A function SQL já devolve o JSON pronto, sem precisar de transformação extra.
export async function onRequestGet({ params, env }) {
  const chave = (params.projeto || '').toLowerCase();
  const projeto = getProjeto(chave);
  if (!projeto) {
    return errorResponse(`Projeto não reconhecido: ${chave}`, 404);
  }

  try {
    const supabase = getSupabaseClient(env);
    const { data, error } = await supabase.rpc('get_movimentacao_detalhada', {
      p_projeto: dbProjetoNome(projeto)
    });
    if (error) return errorResponse(error.message, 502);
    return jsonResponse(data);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
