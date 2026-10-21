// Shared helpers for the media-kit admin functions.
// Not a function endpoint itself (lives in a subfolder), just imported code.

import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

export const STORE_NAME = 'media-kit';
export const STATS_KEY = 'stats.json';
export const COOKIE_NAME = 'mb_admin';
export const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// ---------------------------------------------------------------------------
// DEFAULT_STATS — the baseline the public site falls back to when no admin
// save has happened yet. These mirror the values currently hardcoded in
// index.html so the site looks identical until the first save.
// ---------------------------------------------------------------------------
export const DEFAULT_STATS = {
  verified: 'April 2025',
  ig: {
    // Profile + headline
    followers: 3817,
    followersGrowth: '+2.3%',   // auto-derived from followerHistory on save
    followersSince: 'Jan 2025', // auto-set to the month of the latest follower update
    // Dated follower snapshots — appended on save when `followers` changes.
    // Powers the auto growth % (vs ~60 days ago) and the "updated" month.
    followerHistory: [],
    peakReelViews: 183000,
    peakReelLabel: 'Crème Mood MTL · 100% organic',
    collabs: 12,
    // Overview (last 30 days) — source numbers from IG Insights
    views30: 143869,
    netFollowers: '+44',
    interactions: 5285,
    pctFollowers: 23.1,
    pctNonFollowers: 76.9,
    viewers: 65310,
    viewsReels: '68K',
    viewsStories: '43K',
    viewsPosts: '11K',
    viewsLive: '0',
    intReels: '3.6K',
    intStories: '811',
    intPosts: '672',
    intLive: '0',
    profileVisits: '1.7K',
    bioLinkTaps: '0',
    // Platform card (§02)
    avgViews: '2.8',
    avgViewsUnit: 'K',
    peakReel: '183K',
    peakReelHits: 'Multiple',
    engagementRate: 3.5,   // computed in the admin as interactions ÷ viewers × 100
    benchmark: 1.7,        // editable benchmark; multiplier = ER ÷ benchmark
    viralViews: '7,698',
    viralSource: 'Crème Mood',
    viralMonth: 'Oct 2025',
    // Audience (§03)
    gender: { women: 65, men: 35 },
    ages: [
      { label: '13 – 17', pct: 0.2 },
      { label: '18 – 24', pct: 5.3 },
      { label: '25 – 34', pct: 39.1 },
      { label: '35 – 44', pct: 31.1 },
      { label: '45 – 54', pct: 13.7 },
      { label: '55 – 64', pct: 6.3 },
      { label: '65 +', pct: 2.1 }
    ],
    locations: [
      { name: 'Canada', pct: 85.1 },
      { name: 'United States', pct: 4.3 },
      { name: 'France', pct: 1.2 },
      { name: 'Bangladesh', pct: 0.8 },
      { name: 'India', pct: 0.7 }
    ],
    languages: [
      { name: 'English', pct: 67.3 },
      { name: 'French', pct: 26.2 },
      { name: 'Spanish', pct: 3.1 },
      { name: 'Persian', pct: 0.5 },
      { name: 'Portuguese', pct: 0.5 }
    ],
    windows: [
      { day: 'Tuesday', time: '6–9PM' },
      { day: 'Monday', time: '3–6PM' },
      { day: 'Friday', time: '3–6PM' }
    ]
  },
  tt: {
    followers: 676,
    postViews: '676',
    postViewsUnit: 'K',
    views28: '38K',
    growth28: '+38.7%',
    likes: '28',
    likesUnit: 'K',
    shares: '8,423',
    comments: '248',
    viewers: '547',
    viewersUnit: 'K',
    newViewers: '290K',
    genderF: '76% F',
    fyp: '79.7',
    search: '15.8%',
    profile: '4.4%'
  },
  // Recent films — the 6-card grid on the home page. Edited in the admin
  // "Posts" tab. `image` is either a path under assets/ or an uploaded data URL.
  // `views` is optional; when set it renders with a ◉ prefix.
  posts: [
    { url: 'https://www.instagram.com/reel/DPtsDDFEbOA/', tag: 'Crème Mood MTL · Oct 2025', title: 'The viral one.', views: '183K views · organic', image: 'assets/crememood.jpeg' },
    { url: 'https://www.instagram.com/reel/DPMxt3gkcc0/', tag: 'Collab · Lifestyle', title: 'Fujifilm Ambassador.', views: '', image: 'assets/fujifilm.png' },
    { url: 'https://www.instagram.com/reel/DXCYILsES-D/', tag: 'Collab · Café', title: 'Crew Cafe.', views: '', image: 'assets/crew-cafe.jpeg' },
    { url: 'https://www.instagram.com/p/DRCoigPESqY/', tag: 'Organic · Food Guide', title: 'Toronto Restaurant Guide.', views: '12.9K', image: 'assets/toronto-guide.png' },
    { url: 'https://www.instagram.com/reel/DPwORVHkYlm/', tag: 'Organic · Café', title: 'Café Green Drip.', views: '7.0K', image: 'assets/cafe-green-drip.jpeg' },
    { url: 'https://www.instagram.com/montrealbites/', tag: 'Organic · City Guide', title: 'Montréal Cafés.', views: '', image: 'assets/montreal-cafes.png' }
  ]
};

export const POST_COUNT = 6;

// ---------------------------------------------------------------------------
// Session tokens (HMAC-signed, stateless)
// ---------------------------------------------------------------------------
function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

export function signSession(secret, ttlMs = SESSION_TTL_MS) {
  const payload = b64url(JSON.stringify({ exp: Date.now() + ttlMs }));
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token, secret) {
  if (!token || typeof token !== 'string' || !secret) return false;
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export function readCookie(req, name) {
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function sessionCookie(value, maxAgeSec) {
  const attrs = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${maxAgeSec}`
  ];
  return attrs.join('; ');
}

// ---------------------------------------------------------------------------
// Password verification (scrypt). ADMIN_PASSWORD_HASH format: "scrypt:salt:hash"
// Generate with:
//   node -e "const c=require('crypto');const s=c.randomBytes(16);const h=c.scryptSync(process.argv[1],s,64);console.log('scrypt:'+s.toString('hex')+':'+h.toString('hex'))" 'YOUR_PASSWORD'
// ---------------------------------------------------------------------------
export function verifyPassword(password, stored) {
  if (!password || !stored) return false;
  const parts = String(stored).split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  let derived;
  try {
    derived = scryptSync(String(password), salt, expected.length);
  } catch {
    return false;
  }
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// ---------------------------------------------------------------------------
// Input sanitation — rebuild a clean stats object from untrusted input using
// DEFAULT_STATS as the authoritative shape. Unknown keys are dropped, numbers
// coerced and clamped, strings length-capped, arrays size-capped.
// ---------------------------------------------------------------------------
const MAX_STR = 80;

function cleanStr(v, fallback = '') {
  if (v == null) return fallback;
  return String(v).slice(0, MAX_STR);
}

function cleanNum(v, fallback = 0) {
  const n = Number(String(v).replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, n);
}

function cleanPct(v, fallback = 0) {
  return Math.min(100, cleanNum(v, fallback));
}

// Posts need longer caps than MAX_STR: a title/tag line and, for images, an
// uploaded data: URL (downscaled client-side, but still a few hundred KB).
const MAX_POST_TEXT = 140;
const MAX_IMAGE = 800 * 1024; // ~800KB cap on an image data URL

function cleanPostText(v, fallback = '') {
  if (v == null) return fallback;
  return String(v).slice(0, MAX_POST_TEXT);
}

// Accept only an assets/ path, an http(s) URL, or an inline data:image URL.
function cleanImage(v, fallback = '') {
  if (v == null) return fallback;
  const s = String(v);
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(s)) {
    return s.length <= MAX_IMAGE ? s : fallback;
  }
  if (/^https?:\/\//i.test(s) || /^assets\//.test(s)) return s.slice(0, 500);
  return fallback;
}

// Only allow linking out to Instagram/TikTok (or empty).
function cleanPostUrl(v, fallback = '') {
  if (v == null) return fallback;
  const s = String(v).trim();
  if (s === '') return '';
  if (/^https?:\/\/(www\.)?(instagram\.com|tiktok\.com)\//i.test(s)) return s.slice(0, 300);
  return fallback;
}

function cleanPosts(input, template) {
  const arr = Array.isArray(input) ? input : [];
  return template.map((def, i) => {
    const p = arr[i] && typeof arr[i] === 'object' ? arr[i] : {};
    return {
      url: cleanPostUrl(p.url, def.url),
      tag: cleanPostText(p.tag, def.tag),
      title: cleanPostText(p.title, def.title),
      views: cleanPostText(p.views, def.views),
      image: cleanImage(p.image, def.image)
    };
  });
}

function cleanRows(input, template, fields) {
  const arr = Array.isArray(input) ? input : [];
  return template.map((def, i) => {
    const row = arr[i] && typeof arr[i] === 'object' ? arr[i] : {};
    const out = {};
    for (const f of fields) {
      out[f] = f === 'pct' ? cleanPct(row[f], def[f]) : cleanStr(row[f], def[f]);
    }
    return out;
  });
}

// Format an ISO date as "Oct 2025".
function monthYear(iso) {
  const dt = new Date(iso);
  if (isNaN(dt)) return '';
  return dt.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// Maintain a dated follower history and derive the growth % + "updated" month.
// - A new snapshot is appended whenever the follower count changes.
// - Growth compares the latest count to the snapshot closest to 60 days ago
//   (falls back to the oldest snapshot until 60 days of history exist).
// - "Since" is the month of the most recent follower update.
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
const MAX_HISTORY = 200;

function deriveFollowers(rawHistory, currentFollowers) {
  let history = (Array.isArray(rawHistory) ? rawHistory : [])
    .map((e) => (e && typeof e === 'object' ? { d: String(e.d || ''), v: cleanNum(e.v, 0) } : null))
    .filter((e) => e && !isNaN(new Date(e.d)))
    .sort((a, b) => new Date(a.d) - new Date(b.d))
    .slice(-MAX_HISTORY);

  const nowIso = new Date().toISOString();
  const last = history[history.length - 1];
  if (!last || last.v !== currentFollowers) {
    history.push({ d: nowIso, v: currentFollowers });
  }

  const latest = history[history.length - 1];
  const cutoff = new Date(latest.d).getTime() - SIXTY_DAYS_MS;
  // The most recent snapshot that is at least 60 days older than the latest;
  // if none is that old, compare against the oldest snapshot we have.
  let base = history[0];
  for (const h of history) {
    if (new Date(h.d).getTime() <= cutoff) base = h;
  }

  let growth = '+0%';
  if (base.v > 0) {
    const pct = Math.round(((latest.v - base.v) / base.v) * 1000) / 10;
    growth = (pct >= 0 ? '+' : '') + pct + '%';
  }

  return { history, growth, since: monthYear(latest.d) };
}

export function sanitizeStats(input) {
  const d = DEFAULT_STATS;
  const src = input && typeof input === 'object' ? input : {};
  const ig = src.ig && typeof src.ig === 'object' ? src.ig : {};
  const tt = src.tt && typeof src.tt === 'object' ? src.tt : {};
  const g = ig.gender && typeof ig.gender === 'object' ? ig.gender : {};

  const numKeys = ['followers', 'peakReelViews', 'collabs', 'views30', 'interactions', 'viewers', 'engagementRate', 'benchmark'];
  const pctKeys = ['pctFollowers', 'pctNonFollowers'];
  const strKeys = ['followersGrowth', 'followersSince', 'peakReelLabel', 'netFollowers',
    'viewsReels', 'viewsStories', 'viewsPosts', 'viewsLive', 'intReels', 'intStories',
    'intPosts', 'intLive', 'profileVisits', 'bioLinkTaps', 'avgViews', 'avgViewsUnit',
    'peakReel', 'peakReelHits', 'viralViews', 'viralSource', 'viralMonth'];

  const outIg = {};
  for (const k of numKeys) outIg[k] = cleanNum(ig[k], d.ig[k]);
  for (const k of pctKeys) outIg[k] = cleanPct(ig[k], d.ig[k]);
  // Engagement rate is entered directly in the admin (kept as a plain number).
  for (const k of strKeys) outIg[k] = cleanStr(ig[k], d.ig[k]);
  outIg.avgViewsUnit = 'K'; // Views unit is always "K" (not edited in the admin).
  // Follower history → auto growth (vs ~60 days ago) + "updated" month.
  const derived = deriveFollowers(ig.followerHistory, outIg.followers);
  outIg.followerHistory = derived.history;
  outIg.followersGrowth = derived.growth;
  outIg.followersSince = derived.since;
  outIg.gender = { women: cleanPct(g.women, d.ig.gender.women), men: cleanPct(g.men, d.ig.gender.men) };
  outIg.ages = cleanRows(ig.ages, d.ig.ages, ['label', 'pct']);
  outIg.locations = cleanRows(ig.locations, d.ig.locations, ['name', 'pct']);
  outIg.languages = cleanRows(ig.languages, d.ig.languages, ['name', 'pct']);
  outIg.windows = cleanRows(ig.windows, d.ig.windows, ['day', 'time']);

  const ttNum = ['followers'];
  const ttStr = ['postViews', 'postViewsUnit', 'views28', 'growth28', 'likes', 'likesUnit',
    'shares', 'comments', 'viewers', 'viewersUnit', 'newViewers', 'genderF', 'fyp', 'search', 'profile'];
  const outTt = {};
  for (const k of ttNum) outTt[k] = cleanNum(tt[k], d.tt[k]);
  for (const k of ttStr) outTt[k] = cleanStr(tt[k], d.tt[k]);

  return {
    verified: cleanStr(src.verified, d.verified),
    ig: outIg,
    tt: outTt,
    posts: cleanPosts(src.posts, d.posts),
    updatedAt: new Date().toISOString()
  };
}
