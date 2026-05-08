import { FavoriteList } from "@/components/profile/FavoriteList";
import { MyRatingsList } from "@/components/profile/MyRatingsList";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { UserRating } from "@/features/ratings/rating.types";

export function PersonalPanel({
  rappers,
  favoriteRapperIds,
  myRatings,
}: {
  rappers: Rapper[];
  favoriteRapperIds: string[];
  myRatings: UserRating[];
}) {
  const favoriteRappers = rappers.filter((rapper) =>
    favoriteRapperIds.includes(rapper.id),
  );

  return (
    <section className="grid gap-6 rounded-lg border border-white/10 bg-white/[0.06] p-5 md:grid-cols-2">
      <FavoriteList rappers={favoriteRappers} />
      <MyRatingsList rappers={rappers} ratings={myRatings} />
    </section>
  );
}
