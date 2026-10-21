// Public, read-only endpoint. Returns the current media-kit stats as JSON.
// Served at /api/stats (see netlify.toml). Falls back to DEFAULT_STATS so the
// site always renders even before the first admin save.

import { getStore } from '@netlify/blobs';
import { DEFAULT_STATS, STORE_NAME, STATS_KEY } from './lib/shared.mjs';

export default async () => {
  let data = DEFAULT_STATS;
  try {
    const store = getStore(STORE_NAME);
    const saved = await store.get(STATS_KEY, { type: 'json' });
    if (saved && typeof saved === 'object') {
      // Backfill any field a pre-existing save predates (e.g. `posts`), so the
      // site always receives a complete object even after the schema grows.
      data = { ...DEFAULT_STATS, ...saved };
      if (!Array.isArray(saved.posts) || saved.posts.length === 0) {
        data.posts = DEFAULT_STATS.posts;
      }
    }
  } catch {
    // Blobs unavailable → serve the baseline.
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Always serve fresh figures so admin edits appear on the site immediately.
      'cache-control': 'no-store, max-age=0',
      'netlify-cdn-cache-control': 'no-store'
    }
  });
};
