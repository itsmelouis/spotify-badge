export interface Bindings {
  SPOTIFY_CACHE: KVNamespace;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REFRESH_TOKEN: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  type: "track";
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
}

export interface SpotifyEpisode {
  id: string;
  name: string;
  type: "episode";
}

export interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean;
  progress_ms: number | null;
  item: SpotifyTrack | SpotifyEpisode | null;
}

export interface Track {
  title: string;
  artist: string;
  albumName: string;
  coverUrl: string;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
}

export type NowPlaying =
  | { status: "playing"; track: Track }
  | { status: "not_playing" }
  | { status: "error" };
