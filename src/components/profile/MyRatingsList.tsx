import type { Rapper } from "@/features/rappers/rapper.types";
import type { UserRating } from "@/features/ratings/rating.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function MyRatingsList({
  rappers,
  ratings,
}: {
  rappers: Rapper[];
  ratings: UserRating[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-black uppercase text-white">我的评价</h3>
      {ratings.length === 0 ? (
        <p className="text-sm text-white/45">还没有提交本地评分。</p>
      ) : (
        <div className="grid gap-2">
          {ratings.map((rating) => {
            const rapper = rappers.find((item) => item.id === rating.rapperId);
            if (!rapper) {
              return null;
            }

            return (
              <div
                key={rating.rapperId}
                className="rounded-lg border border-white/10 bg-black/35 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{rapper.name}</p>
                  <span className="font-mono text-lg font-black text-lime-200">
                    {formatScore(calculateOverallScore(rating.ratings))}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/45">
                  更新于 {new Date(rating.updatedAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
