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
    })),
  ).slice(0, 10);
}
