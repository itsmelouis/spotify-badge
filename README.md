<div align="center">

# spotify-badge

[![CI](https://github.com/itsmelouis/spotify-badge/actions/workflows/ci.yml/badge.svg)](https://github.com/itsmelouis/spotify-badge/actions/workflows/ci.yml)
[![CD](https://github.com/itsmelouis/spotify-badge/actions/workflows/deploy.yml/badge.svg)](https://github.com/itsmelouis/spotify-badge/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Bun](https://img.shields.io/badge/bun-v1.3+-black?style=flat-square&logo=bun)](https://bun.com)
[![Cloudflare Workers](https://img.shields.io/badge/cloudflare-workers-f38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com)

Display your currently playing Spotify track as a dynamic SVG badge.

Powered by a Cloudflare Worker — embed it anywhere with a simple `<img>` tag.

[Setup](#setup) • [Embed](#embed) • [Development](#development) • [Deploy](#deploy)

</div>

## Preview

![spotify-badge](https://spotify.itslouis.dev/banner.svg)

## Setup

### 1. Spotify credentials

Create an app on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and get your `Client ID` and `Client Secret`.

Then obtain a refresh token with the `user-read-currently-playing` scope:

```bash
# 1. Open in browser (replace CLIENT_ID)
https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=user-read-currently-playing%20user-read-playback-state

# 2. Exchange the code for tokens
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=authorization_code&code=CODE&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback"
```

### 2. Cloudflare KV namespace

```bash
wrangler kv namespace create SPOTIFY_CACHE
# paste the generated id into wrangler.jsonc
```

### 3. Wrangler secrets

```bash
wrangler secret put SPOTIFY_CLIENT_ID
wrangler secret put SPOTIFY_CLIENT_SECRET
wrangler secret put SPOTIFY_REFRESH_TOKEN
```

## Embed

```markdown
![Now Playing](https://spotify.itslouis.dev/banner.svg)
```

## Development

```bash
bun install
bun run dev       # http://localhost:8787/banner.svg
```

```bash
bun run lint      # oxlint + oxfmt check
bun run lint:fix  # auto-fix
```

## Deploy

```bash
bun run deploy
```

Deployment is also automated via GitHub Actions on every push to `main`. Add your `CLOUDFLARE_API_TOKEN` in **Settings → Secrets and variables → Actions**.

## How it works

- `GET /banner.svg` checks a KV cache (TTL 60s)
- On miss: refreshes the Spotify access token, calls `/me/player/currently-playing`
- Fetches the album cover and embeds it as base64 (required for GitHub rendering)
- Returns a dark-themed SVG with track title, artist, and album
- Falls back to a "Not playing" or "Unavailable" SVG on empty/error states

## License

MIT © [Louis F.](https://github.com/itsmelouis)
