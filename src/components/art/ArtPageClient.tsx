"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { ArtSpiralGallery } from "@/components/art/ArtSpiralGallery";
import type { ArtWallAlbum } from "@/features/art/art-wall.types";
import type { ViewerPresentation } from "@/features/user/user.types";

export function ArtPageClient({
  albums,
  viewer,
}: {
  albums: ArtWallAlbum[];
  viewer: ViewerPresentation;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(217,255,0,0.14),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(255,46,91,0.16),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1600px]">
        <PageHeader
          eyebrow="spiral / covers / collection"
          title="Art Wall"
          description="3D 螺旋专辑封面墙，从 Nirvazure 迁移至 RapperRank 承载。"
          user={viewer}
        />
        <ArtSpiralGallery albums={albums} />
      </div>
    </main>
  );
}
