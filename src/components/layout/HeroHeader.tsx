import { PageHeader } from "@/components/layout/PageHeader";

export function HeroHeader() {
  return (
    <PageHeader
      eyebrow="choose / inspect / rate"
      title="RapperRank"
      description="在详情页查看当前 Rapper 的视觉信息、能力画像和六维评分，在社区页浏览完整排行榜。"
      user={{
        displayName: "匿名用户",
      }}
    />
  );
}
