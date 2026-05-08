import type { RatingDimension } from "@/features/ratings/rating.types";

export type RapperMediaType = "image" | "gif" | "video";

export type Rapper = {
  id: string;
  name: string;
  alias?: string;
  region: string;
  avatarUrl: string;
  mediaUrl: string;
  mediaType: RapperMediaType;
  bio: string;
  shortReview: string;
  tags: string[];
  representativeWorks: string[];
  ratingCount: number;
  averageRatings: RatingDimension;
};
