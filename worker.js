// Serves the static site (public/) and handles the gallery API and image routes.
import * as gallery from './src/gallery.js';
import * as galleryId from './src/gallery-id.js';
import * as img from './src/img.js';

const NO = (m = 405) => new Response('Method not allowed', { status: m });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    const method = request.method;

    if (p === '/api/gallery' || p === '/api/gallery/') {
      if (method === 'GET') return gallery.onRequestGet({ request, env });
      if (method === 'POST') return gallery.onRequestPost({ request, env });
      return NO();
    }
    let m = p.match(/^\/api\/gallery\/([\w-]+)$/);
    if (m) {
      const params = { id: m[1] };
      if (method === 'PATCH') return galleryId.onRequestPatch({ request, env, params });
      if (method === 'PUT') return galleryId.onRequestPut({ request, env, params });
      if (method === 'DELETE') return galleryId.onRequestDelete({ request, env, params });
      return NO();
    }
    if (p.startsWith('/img/')) {
      if (method !== 'GET' && method !== 'HEAD') return NO();
      return img.onRequestGet({ request, env, params: { path: p.slice(5).split('/') } });
    }
    return env.ASSETS.fetch(request);
  },
};
