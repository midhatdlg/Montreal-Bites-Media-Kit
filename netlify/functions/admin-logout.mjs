// Clears the admin session cookie. (The cookie is HttpOnly, so client JS
// cannot clear it directly — this endpoint expires it server-side.)

import { sessionCookie } from './lib/shared.mjs';

export default async () =>
  new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': sessionCookie('', 0)
    }
  });
