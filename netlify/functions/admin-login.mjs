// Verifies the admin password (against a scrypt hash in ADMIN_PASSWORD_HASH)
// and, on success, issues a short-lived HMAC-signed session cookie.
// The password itself never reaches the browser.

import {
  verifyPassword, signSession, sessionCookie, SESSION_TTL_MS
} from './lib/shared.mjs';

const json = (obj, status) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const secret = process.env.SESSION_SECRET;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!secret || !hash) return json({ error: 'not_configured' }, 500);

  let body;
  try { body = await req.json(); } catch { body = {}; }

  const ok = verifyPassword(body && body.password, hash);
  // Fixed delay to dampen brute-force attempts.
  await new Promise((r) => setTimeout(r, 400));
  if (!ok) return json({ error: 'invalid_credentials' }, 401);

  const token = signSession(secret);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': sessionCookie(token, Math.floor(SESSION_TTL_MS / 1000))
    }
  });
};
