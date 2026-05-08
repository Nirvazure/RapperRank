export type RatingKey =
  | "flow"
  | "lyrics"
  | "voice"
  | "technique"
  | "melody"
  | "stage";

export type RatingDimension = Record<RatingKey, number>;

export type UserRating = {
  userId: string;
  rapperId: string;
  ratings: RatingDimension;
  createdAt: string;
  updatedAt: string;
};
