"use client";

import { useEffect, useRef } from "react";

const FADE_MS = 520;

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function RapperBackgroundAudio({ src }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const loadedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const el = audio;

    let cancelled = false;

    function stopFade() {
      if (fadeRafRef.current != null) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
    }

    function fadeOutAndStop(onComplete: () => void) {
      stopFade();

      if (el.paused || el.volume === 0) {
        loadedUrlRef.current = null;
        onComplete();
        return;
      }

      const start = performance.now();
      const startVolume = clampVolume(el.volume);

      function tick(now: number) {
        const progress = Math.max(0, (now - start) / FADE_MS);
        if (progress >= 1) {
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

        el.volume = clampVolume(startVolume * (1 - progress));
        fadeRafRef.current = requestAnimationFrame(tick);
      }

      fadeRafRef.current = requestAnimationFrame(tick);
    }

    function startTrack() {
      if (!src || cancelled) {
        return;
      }

      loadedUrlRef.current = src;
      el.volume = 1;
      el.src = src;
      el.load();
      void el.play().catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("background audio play failed", error);
        }
      });
    }

    if (!src) {
      fadeOutAndStop(() => {});
    } else if (loadedUrlRef.current !== src || audio.paused) {
      fadeOutAndStop(startTrack);
    }

    return () => {
      cancelled = true;
      stopFade();
    };
  }, [src]);

  return <audio ref={audioRef} loop preload="none" className="hidden" aria-hidden />;
}
