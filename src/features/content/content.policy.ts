export type SourcePolicy = {
  kind: string;
  provider: string;
  url: string;
  status: string;
  checkedAt: string | Date | null;
  reviewStatus: string;
};

const externalHosts: Record<string, string[]> = {
  apple: ["music.apple.com"],
  netease: ["music.163.com", "y.music.163.com"],
  qq: ["y.qq.com"],
};

export function safePlaybackUrl(source: Pick<SourcePolicy, "kind" | "provider" | "url">): string | null {
  try {
    const url = new URL(source.url);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (source.kind === "embed") {
      if (source.provider !== "apple" || url.hostname !== "embed.music.apple.com" || !/^\/[a-z]{2}\/(album|song|playlist)\/[^/]+\/(?:\d+|pl\.[\w]+)/.test(url.pathname)) return null;
    } else if (source.kind === "external") {
      if (!externalHosts[source.provider]?.includes(url.hostname)) return null;
    } else if (source.kind === "audio_preview" || source.kind === "audio_full") {
      if (source.provider !== "storage" || url.hostname !== "tfvzcuksahcofooqqezx.supabase.co" || !url.pathname.startsWith("/storage/v1/object/public/rapperank/music/")) return null;
    } else return null;
    return url.href;
  } catch { return null; }
}

export function isCheckedSource(source: SourcePolicy, now = new Date()): boolean {
  if (source.status !== "available" || source.reviewStatus !== "approved" || !source.checkedAt || !safePlaybackUrl(source)) return false;
  const age = now.getTime() - new Date(source.checkedAt).getTime();
  return Number.isFinite(age) && age >= 0 && age <= 30 * 24 * 60 * 60 * 1000;
}

export function isPlayableSource(source: SourcePolicy, now = new Date()): boolean {
  return source.kind !== "external" && isCheckedSource(source, now);
}

export function canPublishAlbum(album: { sources: SourcePolicy[]; tracks: { sources: SourcePolicy[] }[] }, now = new Date()): boolean {
  return album.sources.some((source) => source.kind === "external" && isCheckedSource(source, now))
    && album.tracks.some((track) => track.sources.some((source) => isPlayableSource(source, now)));
}

export function canStoreAsset(asset: { reviewStatus: string; rightsBasis: string; sourceUrl: string; redistributionAllowed: boolean }): boolean {
  if (asset.reviewStatus !== "approved" || !asset.rightsBasis.trim() || !asset.redistributionAllowed) return false;
  try {
    const url = new URL(asset.sourceUrl);
    return url.protocol === "https:" && !url.username && !url.password
      && !["apple.com", "itunes.com", "mzstatic.com", "music.163.com", "music.126.net", "y.qq.com", "qqmusic.qq.com"].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch { return false; }
}
