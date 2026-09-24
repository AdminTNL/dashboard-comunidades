import { getSupabaseClient } from '../../_lib/supabase.js';
import { jsonResponse, errorResponse } from '../../_lib/response.js';

// Equivalente ao workflow n8n "Dados - HTML" (ramal Usinas):
// Webhook2 -> HTTP Request2 (get_dashboard_usinas) -> Respond
// Sem parâmetro de projeto: a function já olha só a tabela de leads do Pará.
export async function onRequestGet({ env }) {
  try {
    const supabase = getSupabaseClient(env);
    const { data, error } = await supabase.rpc('get_dashboard_usinas');
    if (error) return errorResponse(error.message, 502);
    return jsonResponse(data);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
