import { PrismaClient, Prisma } from "@prisma/client";
import { calculateOverallScore } from "@/features/ratings/rating.utils";
import { rapperSeedRecords } from "@/features/rappers/rapper.seed";

const prisma = new PrismaClient();

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(1));
}

async function main() {
  for (const rapper of rapperSeedRecords) {
    const overallScore = calculateOverallScore(rapper.averageRatings);
    const data = {
      seedKey: rapper.seedKey,
      name: rapper.name,
      aliases: rapper.aliases,
      region: rapper.region,
      bio: rapper.bio,
      avatarUrl: rapper.avatarUrl ?? null,
      mediaUrl: rapper.mediaUrl ?? null,
      mediaType: rapper.mediaType,
      backgroundAudioUrl: rapper.backgroundAudioUrl ?? null,
      labels: rapper.labels ?? [],
      tags: rapper.tags,
      representativeWorks: rapper.representativeWorks,
      ratingCount: rapper.ratingCount,
      avgFlow: decimal(rapper.averageRatings.flow),
      avgLyrics: decimal(rapper.averageRatings.lyrics),
      avgVoice: decimal(rapper.averageRatings.voice),
      avgTechnique: decimal(rapper.averageRatings.technique),
      avgMelody: decimal(rapper.averageRatings.melody),
      avgStage: decimal(rapper.averageRatings.stage),
      avgPh: decimal(rapper.averageRatings.ph ?? 0),
      overallScore: decimal(overallScore),
    };

    await prisma.rapper.upsert({
      where: { seedKey: rapper.seedKey },
      update: data,
      create: data,
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
