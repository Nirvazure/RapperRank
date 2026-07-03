import type { Rapper } from "@/features/rappers/rapper.types";
import type { CommunitySortMode } from "@/features/ratings/rating.types";
import { calculateOverallScore } from "@/features/ratings/rating.utils";

export function getRapperById(rappers: Rapper[], rapperId: string): Rapper | undefined {
  return rappers.find((rapper) => rapper.id === rapperId);
}

export function sortRappersByScore(rappers: Rapper[]): Rapper[] {
  return sortRappersForCommunity(rappers, "score");
}

export function sortRappersForCommunity(
  rappers: Rapper[],
  mode: CommunitySortMode,
): Rapper[] {
  return [...rappers].sort((first, second) => {
    const firstScore = first.overallScore ?? calculateOverallScore(first.averageRatings);
    const secondScore = second.overallScore ?? calculateOverallScore(second.averageRatings);

    if (mode === "fondness") {
      if (second.avgFondness !== first.avgFondness) {
        return second.avgFondness - first.avgFondness;
      }

      if (secondScore !== firstScore) {
        return secondScore - firstScore;
      }

      return first.name.localeCompare(second.name, "zh-CN");
    }

    if (secondScore !== firstScore) {
      return secondScore - firstScore;
    }

    if (second.avgFondness !== first.avgFondness) {
      return second.avgFondness - first.avgFondness;
    }

    return first.name.localeCompare(second.name, "zh-CN");
  });
}

export function getRandomRapper(rappers: Rapper[]): Rapper | undefined {
  if (rappers.length === 0) {
    return undefined;
  }

  const index = Math.floor(Math.random() * rappers.length);

  return rappers[index];
}
