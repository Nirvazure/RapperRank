import { prisma } from "@/lib/prisma";

export async function pickRandomRapperSlug(fallback = "kendrick-lamar"): Promise<string> {
  const rows = await prisma.$queryRaw<Array<{ slug: string }>>`
    SELECT slug FROM "rapperank"."Rapper" ORDER BY RANDOM() LIMIT 1
  `;

  return rows[0]?.slug ?? fallback;
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

export async function listRapperSlugs() {
  const rows = await prisma.rapper.findMany({
    select: { slug: true },
  });

  return rows.map((item) => item.slug);
}

export async function findRapperBySlug(slug: string) {
  return prisma.rapper.findUnique({
    where: { slug },
  });
}

export async function findRapperById(id: string) {
  return prisma.rapper.findUnique({
    where: { id },
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
    },
  });
}
