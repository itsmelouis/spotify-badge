import type {
  Bindings,
  NowPlaying,
  SpotifyCurrentlyPlayingResponse,
  SpotifyTokenResponse,
  SpotifyTrack,
} from "../types";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

async function getAccessToken(env: Bindings): Promise<string> {
  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error(`Spotify token error: ${res.status}`);
  }

  const data = (await res.json()) as SpotifyTokenResponse;
  return data.access_token;
}

export async function getNowPlaying(env: Bindings): Promise<NowPlaying> {
  try {
    const accessToken = await getAccessToken(env);

    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 204) {
      return { status: "not_playing" };
    }

    if (!res.ok) {
      return { status: "error" };
    }

    const data = (await res.json()) as SpotifyCurrentlyPlayingResponse;

    if (!data.item || data.item.type !== "track") {
      return { status: "not_playing" };
    }

    const track = data.item as SpotifyTrack;
    const coverUrl = track.album.images[0]?.url ?? "";

    return {
      status: "playing",
      track: {
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        albumName: track.album.name,
        coverUrl,
        durationMs: track.duration_ms,
        progressMs: data.progress_ms ?? 0,
        isPlaying: data.is_playing,
      },
    };
  } catch {
    return { status: "error" };
  }
}
