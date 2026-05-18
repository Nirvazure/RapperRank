-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserKind" AS ENUM ('ANONYMOUS');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('READY', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "RapperMediaType" AS ENUM ('image', 'gif', 'video');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "kind" "UserKind" NOT NULL DEFAULT 'ANONYMOUS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rapper" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chineseName" TEXT,
    "alias" TEXT,
    "region" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "shortReview" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "mediaUrl" TEXT,
    "mediaType" "RapperMediaType" NOT NULL,
    "backgroundAudioUrl" TEXT,
    "labels" TEXT[],
    "tags" TEXT[],
    "representativeWorks" TEXT[],
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'READY',
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "avgFlow" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "avgLyrics" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "avgVoice" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "avgTechnique" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "avgMelody" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "avgStage" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "avgPh" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "overallScore" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rapper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rapperId" TEXT NOT NULL,
    "flow" DECIMAL(3,1) NOT NULL,
    "lyrics" DECIMAL(3,1) NOT NULL,
    "voice" DECIMAL(3,1) NOT NULL,
    "technique" DECIMAL(3,1) NOT NULL,
    "melody" DECIMAL(3,1) NOT NULL,
    "stage" DECIMAL(3,1) NOT NULL,
    "ph" DECIMAL(3,1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rapperId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Rapper_slug_key" ON "Rapper"("slug");

-- CreateIndex
CREATE INDEX "Rating_rapperId_idx" ON "Rating"("rapperId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_rapperId_key" ON "Rating"("userId", "rapperId");

-- CreateIndex
CREATE INDEX "Favorite_rapperId_idx" ON "Favorite"("rapperId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_rapperId_key" ON "Favorite"("userId", "rapperId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_rapperId_fkey" FOREIGN KEY ("rapperId") REFERENCES "Rapper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_rapperId_fkey" FOREIGN KEY ("rapperId") REFERENCES "Rapper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

