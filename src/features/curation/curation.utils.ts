import type {
  CuratedRapper,
  CurationExport,
  CurationFilters,
  CurationOverrides,
  CurationSummary,
} from "@/features/curation/curation.types";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension } from "@/features/ratings/rating.types";
import { calculateOverallScore } from "@/features/ratings/rating.utils";
import { RATING_KEYS } from "@/lib/constants";

export function createDefaultRating(): RatingDimension {
  return {
    flow: 3,
    lyrics: 3,
    voice: 3,
    technique: 3,
    melody: 3,
    stage: 3,
    ph: 0,
  };
}

export function applyCurationOverrides(
  rappers: Rapper[],
  overrides: CurationOverrides,
  options: { includeExcluded?: boolean } = {},
): CuratedRapper[] {
  const excludedIds = new Set(overrides.excludedRapperIds);

  return rappers
    .filter((rapper) => options.includeExcluded || !excludedIds.has(rapper.id))
    .map((rapper) => {
      const ratingOverride = overrides.ratingOverrides[rapper.id];

      return {
        ...rapper,
        averageRatings: ratingOverride ?? rapper.averageRatings,
        isExcluded: excludedIds.has(rapper.id),
        hasRatingOverride: Boolean(ratingOverride),
      };
    });
}

export function isRatingComplete(rating: RatingDimension | undefined): boolean {
  if (!rating) {
    return false;
  }

  return (
    RATING_KEYS.every((key) => Number.isInteger(rating[key])) &&
    Number.isInteger(rating.ph ?? Number.NaN)
  );
}

export function getUnprocessedRappers(
  rappers: Rapper[],
  overrides: CurationOverrides,
): Rapper[] {
  const excludedIds = new Set(overrides.excludedRapperIds);

  return rappers.filter(
    (rapper) =>
      !excludedIds.has(rapper.id) &&
      !isRatingComplete(overrides.ratingOverrides[rapper.id]),
  );
}

export function getRandomUnprocessedRapper(
  rappers: Rapper[],
  overrides: CurationOverrides,
): Rapper | undefined {
  const unprocessed = getUnprocessedRappers(rappers, overrides);

  if (unprocessed.length === 0) {
    return undefined;
  }

  return unprocessed[Math.floor(Math.random() * unprocessed.length)];
}

export function hasDecimalRating(rating: RatingDimension): boolean {
  return [...RATING_KEYS.map((key) => rating[key]), rating.ph ?? 0].some(
    (value) => !Number.isInteger(value),
  );
}

export function getCurationSummary(
  rappers: Rapper[],
  overrides: CurationOverrides,
): CurationSummary {
  const excluded = overrides.excludedRapperIds.length;

  return {
    total: rappers.length,
    retained: Math.max(0, rappers.length - excluded),
    excluded,
    ratingOverrides: Object.keys(overrides.ratingOverrides).length,
  };
}

export function filterCuratedRappers(
  rappers: CuratedRapper[],
  filters: CurationFilters,
): CuratedRapper[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return rappers.filter((rapper) => {
    if (!filters.showExcluded && rapper.isExcluded) {
      return false;
    }

    if (filters.regionFilter && rapper.region !== filters.regionFilter) {
      return false;
    }

    if (filters.tagFilter && !rapper.tags.includes(filters.tagFilter)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchable = [
      rapper.name,
      rapper.alias,
      rapper.chineseName,
      rapper.region,
      ...rapper.tags,
      ...(rapper.labels ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(query);
  });
}

export function sortCuratedRappers(
  rappers: CuratedRapper[],
  sortMode: CurationFilters["sortMode"],
): CuratedRapper[] {
  return [...rappers].sort((first, second) => {
    if (sortMode === "score-asc") {
      return (
        calculateOverallScore(first.averageRatings) -
        calculateOverallScore(second.averageRatings)
      );
    }

    if (sortMode === "name-asc") {
      return first.name.localeCompare(second.name);
    }

    if (sortMode === "recent-updated") {
      return (second.curationUpdatedAt ?? "").localeCompare(
        first.curationUpdatedAt ?? "",
      );
    }

    return (
      calculateOverallScore(second.averageRatings) -
      calculateOverallScore(first.averageRatings)
    );
  });
}

export function buildCurationExport(
  rappers: Rapper[],
  overrides: CurationOverrides,
): CurationExport {
  return {
    ...overrides,
    summary: getCurationSummary(rappers, overrides),
  };
}
