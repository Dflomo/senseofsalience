import { json, readIndex, writeIndex, requireAdmin, cleanTags, clip } from './shared.js';

const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' };

// Public: the list of gallery pieces, newest first (or in the order you arranged).
export async function onRequestGet({ env }) {
  if (!env.GALLERY) return json([], 200, { 'cache-control': 'no-store' });
  return json(await readIndex(env), 200, { 'cache-control': 'public, max-age=20' });
}

// Admin: upload one image (multipart) OR import existing pieces (JSON { import:[...] }).
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const ct = request.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    const items = Array.isArray(body.import) ? body.import : [];
    const list = await readIndex(env);
    let n = 0;
    for (const it of items) {
      const src = String(it.src || '');
      if (!/^assets\/[\w\-./]+\.(webp|jpe?g|png|gif)$/i.test(src)) continue;
      if (list.some(x => x.src === src || x.src === '/' + src)) continue;
      list.push({ id: 'seed-' + Math.random().toString(36).slice(2, 9), src, title: clip(it.title, 80), caption: clip(it.caption, 240), tags: cleanTags(it.tags), year: clip(it.year, 10), added: Date.now() });
      n++;
    }
    await writeIndex(env, list);
    return json({ ok: true, imported: n, items: list });
  }

  const form = await request.formData().catch(() => null);
  const file = form && form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'No image received.' }, 400);
  const ext = TYPES[file.type];
  if (!ext) return json({ error: 'Use a JPG, PNG, WebP or GIF.' }, 415);
  if (file.size > 12 * 1024 * 1024) return json({ error: 'That image is over 12 MB.' }, 413);

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const key = `gallery/${id}.${ext}`;
  await env.GALLERY.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  const item = { id, src: `/img/${key}`, title: clip(form.get('title'), 80) || 'Untitled', caption: clip(form.get('caption'), 240), tags: cleanTags(form.get('tags')), year: clip(form.get('year'), 10) || String(new Date().getFullYear()), added: Date.now() };
  const list = await readIndex(env);
  list.unshift(item);
  await writeIndex(env, list);
  return json({ ok: true, item });
}
