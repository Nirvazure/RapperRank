import type { UserRating } from "@/features/ratings/rating.types";

export type ViewerPresentation = {
  displayName: string;
  isAuthenticated: boolean;
  avatarUrl?: string;
};

export type ViewerUser = {
  id?: string;
  displayName: string;
  avatarUrl?: string;
  ratingsCount?: number;
  favoritesCount?: number;
};

export type ViewerProfile = {
  user: ViewerUser;
  favorites: string[];
  ratings: UserRating[];
};
