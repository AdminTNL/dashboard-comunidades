import { buildLogoutCookie } from '../_lib/auth.js';
import { jsonResponse } from '../_lib/response.js';

export async function onRequestPost() {
  return jsonResponse({ ok: true }, { headers: { 'Set-Cookie': buildLogoutCookie() } });
}
