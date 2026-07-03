export type RadarRatingKey =
  | "flow"
  | "lyrics"
  | "voice"
  | "technique"
  | "melody"
  | "stage";

export type PhRatingKey = "ph";
export type PhOrientation = -1 | 0 | 1;
export type RatingKey = RadarRatingKey | PhRatingKey;
export type RatingDimension = Record<RadarRatingKey, number> & Partial<Record<PhRatingKey, number>>;

export type UserRating = {
  userId: string;
  rapperId: string;
  ratings: RatingDimension;
  fondness?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type RatingSubmission = {
  ratings: RatingDimension;
  fondness: number | null;
};

export type FondnessAggregate = {
  fondnessCount: number;
  avgFondness: number;
};

export type CommunitySortMode = "score" | "fondness";
