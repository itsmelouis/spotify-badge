import type { Track } from "../types";

const W = 500;
const H = 152;
const COVER_SIZE = 110;
const COVER_X = 20;
const COVER_Y = 21;
const TEXT_X = 152;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + chunkSize)));
  }
  return btoa(chunks.join(""));
}

export function generatePlayingBanner(track: Track, coverBase64: string, mimeType: string): string {
  const title = esc(truncate(track.title, 36));
  const artist = esc(truncate(track.artist, 44));
  const album = esc(truncate(track.albumName, 44));
  const coverDataUrl = coverBase64 ? `data:${mimeType};base64,${coverBase64}` : "";

  // Progress bar fill: use progress_ms / duration_ms ratio, clamped 2–95%
  const playingDot = track.isPlaying
    ? `<circle cx="${TEXT_X}" cy="33" r="4" fill="#1DB954">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>`
    : `<circle cx="${TEXT_X}" cy="33" r="4" fill="#535353"/>`;

  const coverSection = coverDataUrl
    ? `<image href="${coverDataUrl}" x="${COVER_X}" y="${COVER_Y}" width="${COVER_SIZE}" height="${COVER_SIZE}"
        clip-path="url(#cover-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="${COVER_X}" y="${COVER_Y}" width="${COVER_SIZE}" height="${COVER_SIZE}"
        rx="6" fill="#282828" clip-path="url(#cover-clip)"/>
       <text x="${COVER_X + COVER_SIZE / 2}" y="${COVER_Y + COVER_SIZE / 2 + 5}"
         text-anchor="middle" font-size="32" fill="#535353">♪</text>`;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="cover-clip">
      <rect x="${COVER_X}" y="${COVER_Y}" width="${COVER_SIZE}" height="${COVER_SIZE}" rx="6" ry="6"/>
    </clipPath>
    <clipPath id="text-clip">
      <rect x="${TEXT_X}" y="0" width="${W - TEXT_X - 8}" height="${H}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" rx="12" ry="12" fill="#0d0d0d"/>
  <!-- Subtle inner border -->
  <rect width="${W}" height="${H}" rx="12" ry="12" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>

  <!-- Cover art -->
  ${coverSection}
  <!-- Cover shadow overlay -->
  <rect x="${COVER_X}" y="${COVER_Y}" width="${COVER_SIZE}" height="${COVER_SIZE}" rx="6"
    fill="none" stroke="#000000" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Now playing indicator -->
  ${playingDot}
  <text x="${TEXT_X + 10}" y="37"
    font-family="${FONT}" font-size="10" font-weight="600"
    fill="#1DB954" letter-spacing="0.8">NOW PLAYING</text>

  <!-- Track title -->
  <text x="${TEXT_X}" y="64" clip-path="url(#text-clip)"
    font-family="${FONT}" font-size="16" font-weight="700" fill="#ffffff">${title}</text>

  <!-- Artist -->
  <text x="${TEXT_X}" y="85" clip-path="url(#text-clip)"
    font-family="${FONT}" font-size="13" fill="#b3b3b3">${artist}</text>

  <!-- Album -->
  <text x="${TEXT_X}" y="103" clip-path="url(#text-clip)"
    font-family="${FONT}" font-size="11" fill="#535353">${album}</text>

  <!-- Spotify wordmark (bottom right) -->
  <text x="${W - 12}" y="${H - 8}" text-anchor="end"
    font-family="${FONT}" font-size="9" fill="#1DB954" font-weight="600" letter-spacing="0.5">Spotify</text>
</svg>`;
}

export function generateNotPlayingBanner(): string {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="12" ry="12" fill="url(#bg-grad)"/>
  <rect width="${W}" height="${H}" rx="12" ry="12" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>

  <!-- Spotify note icon placeholder -->
  <circle cx="62" cy="${H / 2}" r="38" fill="#1a1a1a" stroke="#282828" stroke-width="1"/>
  <text x="62" y="${H / 2 + 10}" text-anchor="middle" font-size="32" fill="#535353">♪</text>

  <text x="118" y="62"
    font-family="${FONT}" font-size="11" font-weight="600"
    fill="#535353" letter-spacing="0.8">SPOTIFY</text>

  <text x="118" y="86"
    font-family="${FONT}" font-size="16" font-weight="700" fill="#6a6a6a">
    Not playing anything
  </text>

  <text x="118" y="106"
    font-family="${FONT}" font-size="12" fill="#404040">
    Nothing on at the moment
  </text>

  <text x="${W - 12}" y="${H - 8}" text-anchor="end"
    font-family="${FONT}" font-size="9" fill="#2a2a2a" font-weight="600" letter-spacing="0.5">Spotify</text>
</svg>`;
}

export function generateErrorBanner(): string {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
  xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" rx="12" ry="12" fill="#0d0d0d"/>
  <rect width="${W}" height="${H}" rx="12" ry="12" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>

  <circle cx="62" cy="${H / 2}" r="38" fill="#1a1a1a" stroke="#282828" stroke-width="1"/>
  <text x="62" y="${H / 2 + 10}" text-anchor="middle" font-size="28" fill="#404040">⚠</text>

  <text x="118" y="68"
    font-family="${FONT}" font-size="15" font-weight="600" fill="#555555">
    Spotify unavailable
  </text>

  <text x="118" y="92"
    font-family="${FONT}" font-size="12" fill="#404040">
    Could not reach Spotify right now
  </text>

  <text x="${W - 12}" y="${H - 8}" text-anchor="end"
    font-family="${FONT}" font-size="9" fill="#2a2a2a" font-weight="600" letter-spacing="0.5">Spotify</text>
</svg>`;
}
