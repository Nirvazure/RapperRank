export type RadarRatingKey =
  | "flow"
  | "lyrics"
  | "voice"
  | "technique"
  | "melody"
  | "stage";

export type PhRatingKey = "ph";
export type RatingKey = RadarRatingKey | PhRatingKey;
export type RatingDimension = Record<RadarRatingKey, number> & Partial<Record<PhRatingKey, number>>;

export type UserRating = {
  userId: string;
  rapperId: string;
  ratings: RatingDimension;
  createdAt: string;
  updatedAt: string;
};
