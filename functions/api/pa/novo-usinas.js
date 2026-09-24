import { getSupabaseClient } from '../../_lib/supabase.js';
import { jsonResponse, errorResponse } from '../../_lib/response.js';

// Equivalente ao workflow n8n "PA - Novo Placar das Usinas":
// Webhook -> HTTP Request (get_usinas_saldo_diario, p_campanha_id=23) -> Respond
// O 23 é fixo no node original do n8n (bodyParameters), não vem de config nenhuma.
const CAMPANHA_ID_NOVO_PLACAR = 23;

export async function onRequestGet({ env }) {
  try {
    const supabase = getSupabaseClient(env);
    const { data, error } = await supabase.rpc('get_usinas_saldo_diario', {
      p_campanha_id: CAMPANHA_ID_NOVO_PLACAR
    });
    if (error) return errorResponse(error.message, 502);
    return jsonResponse(data);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
