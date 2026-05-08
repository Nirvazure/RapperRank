import type { UserRating } from "@/features/ratings/rating.types";

export type MockUser = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  favoriteRapperIds: string[];
  ratings: UserRating[];
};
