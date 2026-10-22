"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StorageImage as Image } from "@/components/rapper/StorageImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ArtWallAlbum } from "@/features/art/art-wall.types";
import { shouldBypassNextImageOptimization } from "@/features/rappers/rapper.media";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_ROOT_SELECTOR = "[data-art-scroll-root]";

function spiralCardTransform(
  i: number,
  n: number,
  radiusScale: number,
): { transform: string; transformOrigin: string } {
  if (n <= 1) {
    return {
      transform: "translate3d(0,0,0) rotateY(0deg)",
      transformOrigin: "center center",
    };
  }

  const turns = 2.65;
  const t = i / (n - 1);
  const angle = t * turns * Math.PI * 2;
  const rMin = 148 * radiusScale;
  const rMax = 430 * radiusScale;
  const radiusT = Math.sqrt(t);
  const radius = rMin + radiusT * (rMax - rMin);
  const ySpread = 11 * radiusScale;
  const yBias = 28 * radiusScale;
  const y = (i - (n - 1) / 2) * ySpread + yBias;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const rotYDeg = (-angle * 180) / Math.PI + 90;

  return {
    transform: `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotYDeg.toFixed(2)}deg)`,
    transformOrigin: "center center",
  };
}

export function ArtSpiralGallery({ albums }: { albums: ArtWallAlbum[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const spiralRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<ArtWallAlbum | null>(null);
  const [radiusScale, setRadiusScale] = useState(1);

  const scheduleRefresh = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches || refreshTimerRef.current !== null) {
      return;
    }

    refreshTimerRef.current = window.setTimeout(() => {
      ScrollTrigger.refresh();
      refreshTimerRef.current = null;
    }, 120);
  }, []);

  useEffect(() => {
    const mm = window.matchMedia("(max-width: 767px)");
    const apply = () => setRadiusScale(mm.matches ? 0.92 : 1);
    apply();
    mm.addEventListener("change", apply);
    return () => mm.removeEventListener("change", apply);
  }, []);

  const cardLayouts = useMemo(
    () => albums.map((_, i) => spiralCardTransform(i, albums.length, radiusScale)),
    [albums, radiusScale],
  );

  useEffect(() => {
    const track = trackRef.current;
    const spiral = spiralRef.current;
    if (!track || !spiral || window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollerEl = document.querySelector(SCROLL_ROOT_SELECTOR) as HTMLElement | null;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        return;
      }

      gsap.set(spiral, { transformPerspective: 1200, transformOrigin: "50% 50%" });

      const stConfig: ScrollTrigger.Vars = {
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.65,
        invalidateOnRefresh: true,
      };

      if (scrollerEl) {
        stConfig.scroller = scrollerEl;
      }

      gsap.timeline({
        scrollTrigger: stConfig,
      }).to(spiral, {
        rotationY: 520,
        rotationX: 3,
        ease: "none",
      });
    }, track);

    scheduleRefresh();

    return () => {
      ctx.revert();
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [albums.length, scheduleRefresh, radiusScale]);

  useEffect(() => {
    if (!selected) {
      return undefined;
    }

    document.body.style.overflow = "hidden";
    const ov = overlayRef.current;
    const pan = panelRef.current;
    const ctx = gsap.context(() => {
      if (ov) {
        gsap.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: 0.22 });
      }
      if (pan) {
        gsap.fromTo(
          pan,
          { scale: 0.9, opacity: 0, y: 12 },
          { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: "power2.out" },
        );
      }
    });
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => {
      window.clearTimeout(t);
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      return undefined;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const closeModal = useCallback(() => {
    const ov = overlayRef.current;
    const pan = panelRef.current;
    if (!ov || !pan) {
      setSelected(null);
      return;
    }

    gsap.to(pan, {
      scale: 0.94,
      opacity: 0,
      y: 16,
      duration: 0.2,
      ease: "power2.in",
    });
    gsap.to(ov, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => setSelected(null),
    });
  }, []);

  return (
    <>
      <section className="mt-5 md:hidden" aria-label="专辑封面画廊">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold text-white/80">封面收藏</p>
          <span className="text-xs text-white/50">点击查看大图</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => setSelected(album)}
              aria-label={`查看 ${album.title}，${album.artist}`}
              className="min-w-0 overflow-hidden rounded-lg border border-white/15 bg-white/[0.04] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
            >
              <span className="relative block aspect-square w-full">
                <Image src={album.coverUrl} alt="" fill sizes="(max-width: 767px) 50vw, 160px" className="object-cover" unoptimized={shouldBypassNextImageOptimization(album.coverUrl)} />
              </span>
              <span className="block px-2.5 py-3">
                <span className="block truncate text-sm font-bold text-white">{album.title}</span>
                <span className="mt-1 block truncate text-xs text-white/55">{album.artist}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <div ref={trackRef} className="relative hidden w-full pt-2 md:block">
        <div
          className="relative mx-auto h-[min(calc(78dvh-var(--rr-chrome-offset,0px)),720px)] w-full max-w-screen-2xl overflow-visible px-1 pb-2 pt-5 sm:px-3 md:px-5 md:pt-7"
          style={{ perspective: "1200px" }}
        >
          <div
            ref={spiralRef}
            className="relative h-full w-full overflow-visible [transform-style:preserve-3d]"
            aria-label="3D 螺旋专辑封面"
          >
            {albums.map((album, i) => {
              const layout = cardLayouts[i]!;
              return (
                <button
                  key={album.id}
                  type="button"
                  className="absolute left-1/2 top-1/2 h-[88px] w-[88px] cursor-pointer overflow-hidden rounded-md border border-white/15 bg-black shadow-md ring-offset-background transition-shadow [backface-visibility:visible] hover:shadow-lg hover:ring-2 hover:ring-lime-200/40 focus:outline-none focus:ring-2 focus:ring-lime-200 md:h-[104px] md:w-[104px]"
                  style={{
                    transform: layout.transform,
                    transformOrigin: layout.transformOrigin,
                  }}
                  aria-label={`${album.title}，${album.artist}`}
                  onClick={() => setSelected(album)}
                >
                  <span className="relative block h-full w-full">
                    <Image
                      src={album.coverUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 112px"
                      loading="eager"
                      unoptimized={shouldBypassNextImageOptimization(album.coverUrl)}
                      onLoad={scheduleRefresh}
                      onError={scheduleRefresh}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[88vh]" aria-hidden />
      </div>

      {selected && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
          role="presentation"
          onClick={closeModal}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="art-wall-dialog-title"
            className="relative max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-md overflow-auto overscroll-contain rounded-xl border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              type="button"
              className="absolute right-2 top-2 flex size-12 items-center justify-center rounded-md text-2xl text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-lime-200"
              aria-label="关闭"
              onClick={closeModal}
            >
              ×
            </button>
            <div className="relative mx-auto mt-10 aspect-square w-[min(100%,280px)] overflow-hidden rounded-lg border border-white/10">
              <Image
                src={selected.coverUrl}
                alt={selected.title}
                fill
                className="object-cover"
                sizes="280px"
                priority
                unoptimized={shouldBypassNextImageOptimization(selected.coverUrl)}
              />
            </div>
            <h2 id="art-wall-dialog-title" className="mt-4 break-words text-lg font-black uppercase text-white">
              {selected.title}
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-white/50">
              {selected.artist} · {selected.year} · {selected.genre}
            </p>
            {selected.notes && (
              <p className="mt-3 text-sm leading-relaxed text-white/80">{selected.notes}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
