export type AppleRecording = {
  trackId: number; artistId: number; trackName: string; artistName: string;
  collectionId?: number; collectionName?: string; trackViewUrl?: string;
  collectionViewUrl?: string; previewUrl?: string; releaseDate?: string;
  trackTimeMillis?: number; trackNumber?: number; discNumber?: number;
};

export function matchRecording<T extends Pick<AppleRecording, "trackName" | "artistId">>(candidates: T[], title: string, artistIds: number[], aliases: string[] = []): T | null {
  const titles = new Set([title, ...aliases].map((value) => value.normalize("NFKC").trim().toLowerCase()));
  return candidates.find((candidate) => artistIds.includes(candidate.artistId) && titles.has(candidate.trackName.normalize("NFKC").trim().toLowerCase())) ?? null;
}

export async function fetchAppleCatalog(term: string, country: string, entity = "song"): Promise<AppleRecording[]> {
  const url = new URL("https://itunes.apple.com/search");
  for (const [key, value] of Object.entries({ term, country, entity, limit: "200" })) url.searchParams.set(key, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Apple catalog HTTP ${response.status}`);
  const body = await response.json();
  if (!Array.isArray(body.results)) throw new Error("Invalid Apple catalog response");
  return body.results;
}
