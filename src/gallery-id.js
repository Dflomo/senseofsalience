import { json, readIndex, writeIndex, requireAdmin, cleanTags, clip } from './shared.js';

// Admin: edit a piece, or move it up/down in the order.
export async function onRequestPatch({ request, env, params }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const list = await readIndex(env);
  const i = list.findIndex(x => x.id === params.id);
  if (i < 0) return json({ error: 'Not found.' }, 404);
  const b = await request.json().catch(() => ({}));
  if (b.move === 'up' && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
  else if (b.move === 'down' && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
  else {
    if ('title' in b) list[i].title = clip(b.title, 80) || 'Untitled';
    if ('caption' in b) list[i].caption = clip(b.caption, 240);
    if ('tags' in b) list[i].tags = cleanTags(b.tags);
    if ('year' in b) list[i].year = clip(b.year, 10);
  }
  await writeIndex(env, list);
  return json({ ok: true, items: list });
}

// Admin: remove a piece (and its stored image).
export async function onRequestDelete({ request, env, params }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const list = await readIndex(env);
  const i = list.findIndex(x => x.id === params.id);
  if (i < 0) return json({ error: 'Not found.' }, 404);
  const [gone] = list.splice(i, 1);
  if (gone.src && gone.src.startsWith('/img/gallery/')) await env.GALLERY.delete(gone.src.replace('/img/', ''));
  await writeIndex(env, list);
  return json({ ok: true, items: list });
}

const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' };

// Admin: replace a piece's image (used by Rotate). Writes a new key so caches refresh.
export async function onRequestPut({ request, env, params }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const list = await readIndex(env);
  const i = list.findIndex(x => x.id === params.id);
  if (i < 0) return json({ error: 'Not found.' }, 404);
  const form = await request.formData().catch(() => null);
  const file = form && form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'No image received.' }, 400);
  const ext = TYPES[file.type];
  if (!ext) return json({ error: 'Use a JPG, PNG, WebP or GIF.' }, 415);
  if (file.size > 12 * 1024 * 1024) return json({ error: 'That image is over 12 MB.' }, 413);
  const key = `gallery/${params.id.replace(/[^\w-]/g, '')}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  await env.GALLERY.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  const old = list[i].src;
  list[i].src = '/img/' + key;
  await writeIndex(env, list);
  if (old && old.startsWith('/img/gallery/')) await env.GALLERY.delete(old.replace('/img/', ''));
  return json({ ok: true, items: list });
}
