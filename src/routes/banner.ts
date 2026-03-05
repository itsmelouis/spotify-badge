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
} as const;

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
      const coverRes = await fetch(track.coverUrl);
      if (coverRes.ok) {
        const contentType = coverRes.headers.get("content-type") ?? "image/jpeg";
        mimeType = contentType.split(";")[0].trim();
        const buffer = await coverRes.arrayBuffer();
        coverBase64 = arrayBufferToBase64(buffer);
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
