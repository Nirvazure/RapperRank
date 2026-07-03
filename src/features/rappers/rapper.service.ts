import { rappers as rapperSeedRecords } from "@/data/rappers";
import { sortRappersByScore } from "@/features/rappers/rapper.utils";

export async function fetchRappers() {
  return rapperSeedRecords;
}

export async function fetchRapper(seedKey: string) {
  return rapperSeedRecords.find((rapper) => rapper.seedKey === seedKey);
}

export async function fetchRanking() {
  return sortRappersByScore(
    rapperSeedRecords.map((record, index) => ({
      ...record,
      id: `seed-${index}`,
      ratingCount: 0,
      averageRatings: {
        flow: 0,
        lyrics: 0,
        voice: 0,
        technique: 0,
        melody: 0,
        stage: 0,
        ph: 0,
      },
      avgFondness: 0,
      fondnessCount: 0,
    })),
  ).slice(0, 10);
}
