# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # local dev server (wrangler dev) at http://localhost:8787
bun run deploy       # deploy to Cloudflare Workers (minified)
bun run lint         # oxlint + oxfmt --check
bun run lint:fix     # auto-fix lint and formatting issues
```

**Always run `bun run lint` before committing.** The CI enforces both oxlint and oxfmt on every push and PR to main — commits that skip this check will fail. If lint reports format issues, run `bun run lint:fix` to auto-fix them, then re-stage the modified files before committing.

## Architecture

Cloudflare Worker (Hono + TypeScript) that serves `GET /banner.svg` — a dynamic SVG showing the currently playing Spotify track, designed to be embedded in a GitHub README via `<img>`.

**Request flow:**

```
GET /banner.svg
  → KV cache hit? → return cached SVG
  → miss: POST accounts.spotify.com/api/token (refresh_token grant)
        → GET api.spotify.com/v1/me/player/currently-playing
        → 200: fetch cover art → encode base64 → generate "playing" SVG
        → 204: generate "not playing" SVG
        → error: generate "error" SVG (never 500)
  → store in KV (TTL 60s) → return SVG
```

**Key design decisions:**

- Album art is base64-embedded in the SVG (GitHub blocks external `<img>` sources inside SVGs)
- `Cache-Control: no-cache` on responses so GitHub doesn't cache the SVG on its CDN
- `Bindings` type is declared manually in `src/types.ts` (not generated via `wrangler types`)
- KV namespace binding: `SPOTIFY_CACHE` (id in `wrangler.jsonc`)

**Required Cloudflare secrets** (set via `wrangler secret put`):

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

## Tooling

- **Formatter/Linter:** oxfmt + oxlint (UnJS rules — plugins: unicorn, typescript, oxc)
- **Config files:** `.oxlintrc.json`, `.oxfmtrc.json`
- **CI:** lint on PRs to main (`.github/workflows/ci.yml`)
- **CD:** `wrangler deploy` on push to main via `CLOUDFLARE_API_TOKEN` secret (`.github/workflows/cd.yml`)
- **Route:** `spotify.itslouis.dev/*` (zone: `itslouis.dev`)
