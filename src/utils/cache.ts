const CACHE_KEY = "now_playing_svg";

export async function getCachedSvg(kv: KVNamespace): Promise<string | null> {
  return kv.get(CACHE_KEY);
}

export async function setCachedSvg(
  kv: KVNamespace,
  svg: string,
  ttlSeconds: number = 60,
): Promise<void> {
  await kv.put(CACHE_KEY, svg, { expirationTtl: ttlSeconds });
}
