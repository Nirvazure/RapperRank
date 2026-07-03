import { prisma } from "@/lib/prisma";

export async function pickRandomRapperId(): Promise<string | null> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "rapperank"."Rapper" ORDER BY RANDOM() LIMIT 1
  `;

  return rows[0]?.id ?? null;
}

export async function listAllRappers() {
  return prisma.rapper.findMany({
    orderBy: [{ overallScore: "desc" }, { name: "asc" }],
  });
}

export async function listTopRappers(limit: number) {
  return prisma.rapper.findMany({
    take: limit,
    orderBy: [{ overallScore: "desc" }, { name: "asc" }],
  });
}

export async function findRapperById(id: string) {
  return prisma.rapper.findUnique({
    where: { id },
  });
}

export async function findRapperBySeedKey(seedKey: string) {
  return prisma.rapper.findUnique({
    where: { seedKey },
  });
}

export async function updateRapperAggregate(input: {
  rapperId: string;
  ratingCount: number;
  avgFlow: number;
  avgLyrics: number;
  avgVoice: number;
  avgTechnique: number;
  avgMelody: number;
  avgStage: number;
  avgPh: number;
  overallScore: number;
  avgFondness: number;
  fondnessCount: number;
}) {
  return prisma.rapper.update({
    where: { id: input.rapperId },
    data: {
      ratingCount: input.ratingCount,
      avgFlow: input.avgFlow,
      avgLyrics: input.avgLyrics,
      avgVoice: input.avgVoice,
      avgTechnique: input.avgTechnique,
      avgMelody: input.avgMelody,
      avgStage: input.avgStage,
      avgPh: input.avgPh,
      overallScore: input.overallScore,
      avgFondness: input.avgFondness,
      fondnessCount: input.fondnessCount,
    },
  });
}
