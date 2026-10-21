// Persists edited stats to Netlify Blobs. Requires a valid session cookie;
// all input is sanitized server-side before it is written.

import { getStore } from '@netlify/blobs';
import {
  verifySession, readCookie, COOKIE_NAME, sanitizeStats, STORE_NAME, STATS_KEY
} from './lib/shared.mjs';

const json = (obj, status) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const secret = process.env.SESSION_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 500);

  const token = readCookie(req, COOKIE_NAME);
  if (!verifySession(token, secret)) return json({ error: 'unauthorized' }, 401);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const clean = sanitizeStats(body && body.data ? body.data : body);

  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(STATS_KEY, clean);
  } catch {
    return json({ error: 'store_failed' }, 500);
  }

  return json({ ok: true, data: clean }, 200);
};
