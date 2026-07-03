import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [deletedRatings, deletedFavorites, updatedRappers] = await prisma.$transaction([
    prisma.rating.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.rapper.updateMany({
      data: {
        ratingCount: 0,
        avgFlow: 0,
        avgLyrics: 0,
        avgVoice: 0,
        avgTechnique: 0,
        avgMelody: 0,
        avgStage: 0,
        avgPh: 0,
        overallScore: 0,
      },
    }),
  ]);

  console.log(`Deleted ${deletedRatings.count} ratings`);
  console.log(`Deleted ${deletedFavorites.count} favorites`);
  console.log(`Reset aggregates on ${updatedRappers.count} rappers`);
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
