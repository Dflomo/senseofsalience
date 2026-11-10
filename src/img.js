// Serves stored gallery images. Only keys under gallery/ are reachable, and never the index.
export async function onRequestGet({ env, params }) {
  if (!env.GALLERY) return new Response('Not found', { status: 404 });
  const key = [].concat(params.path || []).join('/');
  if (!/^gallery\/[\w\-]+\.(webp|jpg|png|gif)$/.test(key)) return new Response('Not found', { status: 404 });
  const o = await env.GALLERY.get(key);
  if (!o) return new Response('Not found', { status: 404 });
  return new Response(o.body, { headers: { 'content-type': o.httpMetadata?.contentType || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff', etag: o.httpEtag } });
}
