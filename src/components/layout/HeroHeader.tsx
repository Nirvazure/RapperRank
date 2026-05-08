export function HeroHeader() {
  return (
    <header className="flex flex-col gap-3 border-b border-white/10 pb-4 text-white md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-lime-200">
          choose / inspect / rate
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase leading-[0.86] sm:text-6xl md:text-7xl">
          RapperRank
        </h1>
      </div>
      <div className="max-w-xl">
        <p className="text-sm font-bold leading-6 text-white/70">
          主页聚焦 Rapper 视觉、能力画像和六维评分；榜单与收藏已拆成独立页面。
        </p>
      </div>
    </header>
  );
}
