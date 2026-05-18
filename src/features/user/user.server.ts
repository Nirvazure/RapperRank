import { listFavoritesForUser } from "@/features/favorites/favorite.repository";
import { mapRapperRecordToViewModel, mapRatingRecordToUserRating } from "@/features/rappers/rapper.mapper";
import { listRatingsForUser } from "@/features/ratings/rating.repository";

export async function getViewerFavorites(userId: string) {
  const favorites = await listFavoritesForUser(userId);
  return favorites.map((favorite) => mapRapperRecordToViewModel(favorite.rapper));
}

export async function getViewerRatings(userId: string) {
  const ratings = await listRatingsForUser(userId);
  return ratings.map(mapRatingRecordToUserRating);
}
