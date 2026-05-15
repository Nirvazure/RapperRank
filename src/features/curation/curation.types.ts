import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension } from "@/features/ratings/rating.types";

export type CurationOverrides = {
  version: 1;
  updatedAt: string | null;
  excludedRapperIds: string[];
  ratingOverrides: Record<string, RatingDimension>;
};

export type CurationSortMode =
  | "score-desc"
  | "score-asc"
  | "name-asc"
  | "recent-updated";

export type CurationFilters = {
  searchQuery: string;
  regionFilter: string;
  tagFilter: string;
  showExcluded: boolean;
  sortMode: CurationSortMode;
};

export type CurationSummary = {
  total: number;
  retained: number;
  excluded: number;
  ratingOverrides: number;
};

export type CuratedRapper = Rapper & {
  isExcluded: boolean;
  hasRatingOverride: boolean;
  curationUpdatedAt?: string;
};

export type CurationExport = CurationOverrides & {
  summary: CurationSummary;
};
