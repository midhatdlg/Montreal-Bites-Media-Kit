# Media Kit — Admin setup

The media kit numbers are now updated through a secure admin page instead of
being hardcoded. You type values in, they save to the server (Netlify Blobs),
and every visitor sees them. No Instagram/TikTok API, tokens, or developer apps.

## How it works

- **`/admin`** — password-protected editor. Mirrors your Instagram Insights
  screens so updating is just transcription. Engagement rate is auto-calculated
  (`interactions ÷ viewers × 100`).
- **`/api/stats`** — public JSON the home page reads on load. If nothing has been
  saved yet, it serves the original hardcoded values, so the site always works.
- The password never reaches the browser; only its hash lives on the server.

## One-time setup — two environment variables

You must set these in **Netlify → Site settings → Environment variables**.
Nothing here is committed to git.

### 1. `ADMIN_PASSWORD_HASH`

Pick a password, then generate its hash locally (run in Terminal, replacing
`YOUR_PASSWORD`):

```bash
node -e "const c=require('crypto');const s=c.randomBytes(16);const h=c.scryptSync(process.argv[1],s,64);console.log('scrypt:'+s.toString('hex')+':'+h.toString('hex'))" 'YOUR_PASSWORD'
```

Copy the whole `scrypt:...:...` line into `ADMIN_PASSWORD_HASH`.
(To change the password later, re-run this and update the value.)

### 2. `SESSION_SECRET`

A random signing key for login sessions:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into `SESSION_SECRET`.

After setting both, redeploy (or trigger a deploy) so the functions pick them up.

## Local development

```bash
npm install
# create a local .env (gitignored) with the two vars above, then:
netlify dev
```

Open http://localhost:8888/admin.

## Deploy notes

- The site publishes from the repo root with functions in `netlify/functions`
  (see `netlify.toml`). Netlify installs `@netlify/blobs` automatically from
  `package.json`.
- Netlify Blobs is enabled by default for functions — no extra config.
- The old `/update` page, its hardcoded password, and the orphaned
  `media-kit-data.js` / `media-kit-apply.js` have been removed.
