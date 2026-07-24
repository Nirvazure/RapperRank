"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { GlobalPlayerBar } from "@/components/audio/GlobalPlayerBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useRapperPlayer } from "@/contexts/RapperPlayerContext";

function chromeOffset(hideBottomNav: boolean, hasPlayer: boolean): string {
  const parts: string[] = [];
  if (!hideBottomNav) {
    parts.push("var(--rr-bottom-nav)");
  }
  if (hasPlayer) {
    parts.push("var(--rr-player-bar)");
  }
  parts.push("env(safe-area-inset-bottom, 0px)");
  return `calc(${parts.join(" + ")})`;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentTrack } = useRapperPlayer();
  const hideBottomNav = pathname === "/login";
  const hasPlayer = Boolean(currentTrack);
  const offset = chromeOffset(hideBottomNav, hasPlayer);

  return (
    <>
      <div
        className="min-h-full"
        data-rr-has-player={hasPlayer ? "true" : "false"}
        data-rr-hide-nav={hideBottomNav ? "true" : "false"}
        style={
          {
            paddingBottom: offset,
            "--rr-chrome-offset": offset,
          } as CSSProperties
        }
      >
        {children}
      </div>
      <GlobalPlayerBar hideBottomNav={hideBottomNav} />
      <MobileBottomNav />
    </>
  );
}
