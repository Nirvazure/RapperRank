"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { usePathname } from "next/navigation";
import { useRappersQuery } from "@/features/rappers/rapper.queries";
import { getRapperById } from "@/features/rappers/rapper.utils";

const FADE_MS = 520;

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function stopFade(rafRef: MutableRefObject<number | null>) {
  if (rafRef.current != null) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
}

/**
 * 当路由为 /rank/:rapperId 且该艺人配置了 backgroundAudioUrl 时后台循环播放；
 * 离开该艺人或离开艺人详情路由时先淡出再停止（见 FADE_MS）。
 */
export function RapperBackgroundAudio() {
  const pathname = usePathname();
  const { data: rappers = [], isPending } = useRappersQuery();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const loadedUrlRef = useRef<string | null>(null);

  const rankMatch = pathname.match(/^\/rank\/([^/]+)/);
  const routeRapperId = rankMatch?.[1];
  const routeRapper = routeRapperId
    ? getRapperById(rappers, routeRapperId)
    : undefined;
  const targetUrl = routeRapper?.backgroundAudioUrl;
  const onRankPage = Boolean(rankMatch);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const el = audio;

    if (onRankPage && isPending) {
      return () => {
        stopFade(fadeRafRef);
      };
    }

    let cancelled = false;

    function fadeOutAndStop(onComplete: () => void) {
      stopFade(fadeRafRef);

      if (el.paused || el.volume === 0) {
        loadedUrlRef.current = null;
        onComplete();
        return;
      }

      const start = performance.now();
      const startVol = clampVolume(el.volume);

      function tick(now: number) {
        const t = Math.max(0, (now - start) / FADE_MS);
        if (t >= 1) {
          el.volume = 0;
          el.pause();
          el.volume = 1;
          loadedUrlRef.current = null;
          fadeRafRef.current = null;
          if (!cancelled) {
            onComplete();
          }
          return;
        }
        el.volume = clampVolume(startVol * (1 - t));
        fadeRafRef.current = requestAnimationFrame(tick);
      }

      fadeRafRef.current = requestAnimationFrame(tick);
    }

    function startTargetTrack() {
      if (cancelled || !targetUrl) {
        return;
      }
      loadedUrlRef.current = targetUrl;
      el.volume = 1;
      el.src = targetUrl;
      el.load();
      void el.play().catch(() => {});
    }

    if (targetUrl && loadedUrlRef.current === targetUrl && !el.paused) {
      return () => {
        cancelled = true;
        stopFade(fadeRafRef);
      };
    }

    if (!targetUrl) {
      fadeOutAndStop(() => {});
    } else {
      fadeOutAndStop(() => {
        if (cancelled) {
          return;
        }
        startTargetTrack();
      });
    }

    return () => {
      cancelled = true;
      stopFade(fadeRafRef);
    };
  }, [targetUrl, isPending, onRankPage]);

  return (
    <audio
      ref={audioRef}
      loop
      preload="none"
      className="hidden"
      aria-hidden
    />
  );
}
