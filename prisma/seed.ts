import { PrismaClient } from "@prisma/client";
import { rapperSeedRecords } from "@/features/rappers/rapper.seed";

const prisma = new PrismaClient();

async function main() {
  for (const rapper of rapperSeedRecords) {
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
