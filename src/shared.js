// Shared helpers for the gallery API. Not a route (it exports no handler).
export const INDEX_KEY = 'gallery/index.json';
export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff', ...extra } });

export async function readIndex(env) {
  const o = await env.GALLERY.get(INDEX_KEY);
  if (!o) return [];
  try { const v = await o.json(); return Array.isArray(v) ? v : []; } catch { return []; }
}
export const writeIndex = (env, list) =>
  env.GALLERY.put(INDEX_KEY, JSON.stringify(list), { httpMetadata: { contentType: 'application/json' } });

async function digest(s) { return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))); }

// Returns a Response when the request is NOT allowed, or null when it is.
export async function requireAdmin(request, env) {
  if (!env.GALLERY) return json({ error: 'Storage is not connected yet. See SETUP.md, step 3.' }, 500);
  if (!env.ADMIN_PASSWORD) return json({ error: 'No admin password is set yet. See SETUP.md, step 4.' }, 500);
  const given = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const [a, b] = await Promise.all([digest(given), digest(env.ADMIN_PASSWORD)]);
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) { await new Promise(r => setTimeout(r, 600)); return json({ error: 'Wrong password.' }, 401); }
  return null;
}

export function cleanTags(t) {
  const arr = Array.isArray(t) ? t : String(t || '').split(',');
  const out = [];
  for (const x of arr) { const s = String(x).trim().slice(0, 30); if (s && !out.some(o => o.toLowerCase() === s.toLowerCase())) out.push(s); }
  return out.slice(0, 8);
}
export const clip = (s, n) => String(s || '').trim().slice(0, n);
