import { PrismaClient, Prisma } from "@prisma/client";
import { calculateOverallScore } from "@/features/ratings/rating.utils";
import { rapperSeedRecords } from "@/features/rappers/rapper.seed";

const prisma = new PrismaClient();

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(1));
}

async function main() {
  for (const rapper of rapperSeedRecords) {
    const slug = rapper.slug ?? rapper.id;
    const overallScore = calculateOverallScore(rapper.averageRatings);
    await prisma.rapper.upsert({
      where: { slug },
      update: {
        name: rapper.name,
        chineseName: rapper.chineseName ?? null,
        alias: rapper.alias ?? null,
        region: rapper.region,
        bio: rapper.bio,
        shortReview: rapper.shortReview,
        avatarUrl: rapper.avatarUrl ?? null,
        mediaUrl: rapper.mediaUrl ?? null,
        mediaType: rapper.mediaType,
        backgroundAudioUrl: rapper.backgroundAudioUrl ?? null,
        labels: rapper.labels ?? [],
        tags: rapper.tags,
        representativeWorks: rapper.representativeWorks,
        contentStatus: rapper.contentStatus === "incomplete" ? "INCOMPLETE" : "READY",
        ratingCount: rapper.ratingCount,
        avgFlow: decimal(rapper.averageRatings.flow),
        avgLyrics: decimal(rapper.averageRatings.lyrics),
        avgVoice: decimal(rapper.averageRatings.voice),
        avgTechnique: decimal(rapper.averageRatings.technique),
        avgMelody: decimal(rapper.averageRatings.melody),
        avgStage: decimal(rapper.averageRatings.stage),
        avgPh: decimal(rapper.averageRatings.ph ?? 0),
        overallScore: decimal(overallScore),
      },
      create: {
        slug,
        name: rapper.name,
        chineseName: rapper.chineseName ?? null,
        alias: rapper.alias ?? null,
        region: rapper.region,
        bio: rapper.bio,
        shortReview: rapper.shortReview,
        avatarUrl: rapper.avatarUrl ?? null,
        mediaUrl: rapper.mediaUrl ?? null,
        mediaType: rapper.mediaType,
        backgroundAudioUrl: rapper.backgroundAudioUrl ?? null,
        labels: rapper.labels ?? [],
        tags: rapper.tags,
        representativeWorks: rapper.representativeWorks,
        contentStatus: rapper.contentStatus === "incomplete" ? "INCOMPLETE" : "READY",
        ratingCount: rapper.ratingCount,
        avgFlow: decimal(rapper.averageRatings.flow),
        avgLyrics: decimal(rapper.averageRatings.lyrics),
        avgVoice: decimal(rapper.averageRatings.voice),
        avgTechnique: decimal(rapper.averageRatings.technique),
        avgMelody: decimal(rapper.averageRatings.melody),
        avgStage: decimal(rapper.averageRatings.stage),
        avgPh: decimal(rapper.averageRatings.ph ?? 0),
        overallScore: decimal(overallScore),
      },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
