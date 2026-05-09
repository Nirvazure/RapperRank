import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore } from "@/features/ratings/rating.utils";

export function getRapperById(rappers: Rapper[], rapperId: string): Rapper | undefined {
  return rappers.find((rapper) => rapper.id === rapperId);
}

export function sortRappersByScore(rappers: Rapper[]): Rapper[] {
  return [...rappers].sort(
    (first, second) =>
      calculateOverallScore(second.averageRatings) -
      calculateOverallScore(first.averageRatings),
  );
}

export function getRandomRapper(rappers: Rapper[]): Rapper | undefined {
  if (rappers.length === 0) {
    return undefined;
  }

  const index = Math.floor(Math.random() * rappers.length);

  return rappers[index];
}
