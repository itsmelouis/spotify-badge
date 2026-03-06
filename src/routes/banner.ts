import { Hono } from "hono";
import type { Bindings } from "../types";
import { getNowPlaying } from "../services/spotify";
import { getCachedSvg, setCachedSvg } from "../utils/cache";
import {
  arrayBufferToBase64,
  generateErrorBanner,
  generateNotPlayingBanner,
  generatePlayingBanner,
} from "../utils/svg";

const SVG_HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
} as const;

const ALLOWED_COVER_HOSTS = [
  "i.scdn.co",
  "mosaic.scdn.co",
  "image-cdn-ak.spotifycdn.com",
  "image-cdn-fa.spotifycdn.com",
];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_COVER_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const FETCH_TIMEOUT_MS = 5_000;

const banner = new Hono<{ Bindings: Bindings }>();

banner.get("/banner.svg", async (c) => {
  const cached = await getCachedSvg(c.env.SPOTIFY_CACHE);
  if (cached) {
    return c.body(cached, 200, SVG_HEADERS);
  }

  const nowPlaying = await getNowPlaying(c.env);

  if (nowPlaying.status === "error") {
    const svg = generateErrorBanner();
    return c.body(svg, 200, SVG_HEADERS);
  }

  if (nowPlaying.status === "not_playing") {
    const svg = generateNotPlayingBanner();
    await setCachedSvg(c.env.SPOTIFY_CACHE, svg, 60);
    return c.body(svg, 200, SVG_HEADERS);
  }

  const { track } = nowPlaying;
  let coverBase64 = "";
  let mimeType = "image/jpeg";

  if (track.coverUrl) {
    try {
      const coverUrl = new URL(track.coverUrl);
      if (coverUrl.protocol === "https:" && ALLOWED_COVER_HOSTS.includes(coverUrl.hostname)) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        const coverRes = await fetch(coverUrl.href, { signal: controller.signal });
        clearTimeout(timer);
        if (coverRes.ok) {
          const contentType = coverRes.headers.get("content-type") ?? "image/jpeg";
          const detected = contentType.split(";")[0].trim();
          if (ALLOWED_MIME_TYPES.includes(detected)) {
            const contentLength = Number(coverRes.headers.get("content-length") ?? 0);
            if (contentLength <= MAX_COVER_SIZE_BYTES) {
              const buffer = await coverRes.arrayBuffer();
              if (buffer.byteLength <= MAX_COVER_SIZE_BYTES) {
                mimeType = detected;
                coverBase64 = arrayBufferToBase64(buffer);
              }
            }
          }
        }
      }
    } catch {
      // fallback: no cover, SVG will show placeholder
    }
  }

  const svg = generatePlayingBanner(track, coverBase64, mimeType);
  await setCachedSvg(c.env.SPOTIFY_CACHE, svg, 60);
  return c.body(svg, 200, SVG_HEADERS);
});

export default banner;
