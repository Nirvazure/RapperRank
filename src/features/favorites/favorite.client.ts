export async function toggleFavoriteRequest(rapperId: string, isFavorite: boolean) {
  const response = await fetch(`/api/me/favorites/${rapperId}`, {
    method: isFavorite ? "DELETE" : "POST",
  });

  if (!response.ok) {
    throw new Error("favorite request failed");
  }
}
