-- CreateEnum
CREATE TYPE "rapperank"."ContentReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "rapperank"."PlaybackKind" AS ENUM ('external', 'embed', 'audio_preview', 'audio_full');

-- CreateEnum
CREATE TYPE "rapperank"."PlaybackStatus" AS ENUM ('pending', 'available', 'unavailable');

-- AlterTable
ALTER TABLE "rapperank"."Rapper" ADD COLUMN     "contentReviewedAt" TIMESTAMP(3),
ADD COLUMN     "officialLinks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "profileTimeline" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "rapperank"."ContentSource" (
    "id" TEXT NOT NULL,
    "rapperId" TEXT,
    "trackId" TEXT,
    "albumId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fields" TEXT[],
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "reviewStatus" "rapperank"."ContentReviewStatus" NOT NULL DEFAULT 'pending',
    "reviewer" TEXT,

    CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapperank"."Track" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistCredit" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "releasedAt" DATE,
    "durationMs" INTEGER,
    "isrc" TEXT,
    "reviewStatus" "rapperank"."ContentReviewStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapperank"."RapperTrack" (
    "rapperId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'primary',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RapperTrack_pkey" PRIMARY KEY ("rapperId","trackId")
);

-- CreateTable
CREATE TABLE "rapperank"."Album" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistCredit" TEXT NOT NULL,
    "releasedAt" DATE,
    "reviewStatus" "rapperank"."ContentReviewStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapperank"."AlbumTrack" (
    "albumId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "discNumber" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AlbumTrack_pkey" PRIMARY KEY ("albumId","discNumber","position")
);

-- CreateTable
CREATE TABLE "rapperank"."PlaybackSource" (
    "id" TEXT NOT NULL,
    "trackId" TEXT,
    "albumId" TEXT,
    "kind" "rapperank"."PlaybackKind" NOT NULL,
    "provider" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "storefront" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "conditions" TEXT NOT NULL,
    "status" "rapperank"."PlaybackStatus" NOT NULL DEFAULT 'pending',
    "checkedAt" TIMESTAMP(3),
    "verificationNote" TEXT,
    "reviewStatus" "rapperank"."ContentReviewStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "PlaybackSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapperank"."MediaAsset" (
    "id" TEXT NOT NULL,
    "rapperId" TEXT,
    "trackId" TEXT,
    "albumId" TEXT,
    "sourceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'rapperank',
    "objectPath" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationSeconds" DOUBLE PRECISION,
    "caption" TEXT NOT NULL,
    "attribution" TEXT NOT NULL,
    "rightsBasis" TEXT NOT NULL,
    "redistributionAllowed" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" "rapperank"."ContentReviewStatus" NOT NULL DEFAULT 'pending',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentSource_rapperId_idx" ON "rapperank"."ContentSource"("rapperId");

-- CreateIndex
CREATE INDEX "ContentSource_trackId_idx" ON "rapperank"."ContentSource"("trackId");

-- CreateIndex
CREATE INDEX "ContentSource_albumId_idx" ON "rapperank"."ContentSource"("albumId");

-- CreateIndex
CREATE INDEX "RapperTrack_trackId_idx" ON "rapperank"."RapperTrack"("trackId");

-- CreateIndex
CREATE INDEX "AlbumTrack_trackId_idx" ON "rapperank"."AlbumTrack"("trackId");

-- CreateIndex
CREATE INDEX "PlaybackSource_trackId_idx" ON "rapperank"."PlaybackSource"("trackId");

-- CreateIndex
CREATE INDEX "PlaybackSource_albumId_idx" ON "rapperank"."PlaybackSource"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackSource_provider_platformId_storefront_kind_key" ON "rapperank"."PlaybackSource"("provider", "platformId", "storefront", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_objectPath_key" ON "rapperank"."MediaAsset"("objectPath");

-- CreateIndex
CREATE INDEX "MediaAsset_rapperId_idx" ON "rapperank"."MediaAsset"("rapperId");

-- CreateIndex
CREATE INDEX "MediaAsset_trackId_idx" ON "rapperank"."MediaAsset"("trackId");

-- CreateIndex
CREATE INDEX "MediaAsset_albumId_idx" ON "rapperank"."MediaAsset"("albumId");

-- AddForeignKey
ALTER TABLE "rapperank"."ContentSource" ADD CONSTRAINT "ContentSource_rapperId_fkey" FOREIGN KEY ("rapperId") REFERENCES "rapperank"."Rapper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."ContentSource" ADD CONSTRAINT "ContentSource_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "rapperank"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."ContentSource" ADD CONSTRAINT "ContentSource_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "rapperank"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."RapperTrack" ADD CONSTRAINT "RapperTrack_rapperId_fkey" FOREIGN KEY ("rapperId") REFERENCES "rapperank"."Rapper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."RapperTrack" ADD CONSTRAINT "RapperTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "rapperank"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."AlbumTrack" ADD CONSTRAINT "AlbumTrack_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "rapperank"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."AlbumTrack" ADD CONSTRAINT "AlbumTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "rapperank"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."PlaybackSource" ADD CONSTRAINT "PlaybackSource_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "rapperank"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."PlaybackSource" ADD CONSTRAINT "PlaybackSource_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "rapperank"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."MediaAsset" ADD CONSTRAINT "MediaAsset_rapperId_fkey" FOREIGN KEY ("rapperId") REFERENCES "rapperank"."Rapper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."MediaAsset" ADD CONSTRAINT "MediaAsset_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "rapperank"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."MediaAsset" ADD CONSTRAINT "MediaAsset_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "rapperank"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapperank"."MediaAsset" ADD CONSTRAINT "MediaAsset_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "rapperank"."ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Content is served through Prisma; browser roles must not access review drafts.
ALTER TABLE "rapperank"."ContentSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rapperank"."Track" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rapperank"."RapperTrack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rapperank"."Album" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rapperank"."AlbumTrack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rapperank"."PlaybackSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rapperank"."MediaAsset" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "rapperank"."ContentSource", "rapperank"."Track", "rapperank"."RapperTrack", "rapperank"."Album", "rapperank"."AlbumTrack", "rapperank"."PlaybackSource", "rapperank"."MediaAsset" FROM anon, authenticated;

ALTER TABLE "rapperank"."ContentSource" ADD CONSTRAINT "ContentSource_one_owner" CHECK (num_nonnulls("rapperId", "trackId", "albumId") = 1);
ALTER TABLE "rapperank"."PlaybackSource" ADD CONSTRAINT "PlaybackSource_one_owner" CHECK (num_nonnulls("trackId", "albumId") = 1);
ALTER TABLE "rapperank"."MediaAsset" ADD CONSTRAINT "MediaAsset_one_owner" CHECK (num_nonnulls("rapperId", "trackId", "albumId") = 1);
ALTER TABLE "rapperank"."PlaybackSource" ADD CONSTRAINT "PlaybackSource_evidence" CHECK ("status" <> 'available' OR ("checkedAt" IS NOT NULL AND "verificationNote" IS NOT NULL AND length(trim("verificationNote")) > 0));
ALTER TABLE "rapperank"."AlbumTrack" ADD CONSTRAINT "AlbumTrack_positive_position" CHECK ("discNumber" > 0 AND "position" > 0);
ALTER TABLE "rapperank"."MediaAsset" ADD CONSTRAINT "MediaAsset_approved_rights" CHECK ("reviewStatus" <> 'approved' OR ("redistributionAllowed" AND length(trim("rightsBasis")) > 0));
