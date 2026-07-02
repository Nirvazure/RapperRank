import { ArtPageClient } from "@/components/art/ArtPageClient";
import { artWallAlbums } from "@/lib/art-wall";
import { getViewer } from "@/lib/server/viewer";

export const dynamic = "force-dynamic";

export default async function ArtPage() {
  const viewer = await getViewer();

  return <ArtPageClient albums={artWallAlbums} viewer={viewer} />;
}
