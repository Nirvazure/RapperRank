import { rappers } from "@/data/rappers";
import { sortRappersByScore } from "@/features/rappers/rapper.utils";

export async function fetchRappers() {
  return rappers;
}

export async function fetchRapper(rapperId: string) {
  return rappers.find((rapper) => rapper.id === rapperId);
}

export async function fetchRanking() {
  return sortRappersByScore(rappers).slice(0, 10);
}
