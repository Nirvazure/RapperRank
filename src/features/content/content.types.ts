export type ContentReference = { id: string; title: string; url: string; fields: string[] };
export type TimelineEntry = { date: string; text: string; sourceId: string };
export type OfficialLink = { label: string; url: string };
export type PlaybackSourceView = {
  id: string;
  kind: "external" | "embed" | "audio_preview" | "audio_full";
  provider: string;
  url: string;
  storefront: string;
  durationSeconds: number | null;
  conditions: string;
  status: string;
  checkedAt: string | null;
  reviewStatus: string;
};
export type TrackView = { id: string; title: string; artistCredit: string; version: string; releasedAt: string | null; durationMs: number | null; sources: PlaybackSourceView[] };
export type AlbumView = { id: string; title: string; artistCredit: string; releasedAt: string | null; sources: PlaybackSourceView[]; tracks: TrackView[]; coverUrl?: string };
export type GalleryImage = { id: string; url: string; caption: string; attribution: string; rightsBasis: string; sourceUrl: string };
export type RapperContent = { timeline: TimelineEntry[]; officialLinks: OfficialLink[]; references: ContentReference[]; tracks: TrackView[]; albums: AlbumView[]; gallery: GalleryImage[] };
