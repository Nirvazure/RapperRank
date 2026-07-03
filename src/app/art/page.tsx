import { ArtPageClient } from "@/components/art/ArtPageClient";
import { artWallAlbums } from "@/lib/art-wall";
import { resolvePageViewer } from "@/lib/server/viewer";

export default async function ArtPage() {
  const viewer = await resolvePageViewer();

  return <ArtPageClient albums={artWallAlbums} viewer={viewer} />;
}
