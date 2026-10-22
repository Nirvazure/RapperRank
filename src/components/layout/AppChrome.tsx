"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

function chromeOffset(hideBottomNav: boolean): string {
  const parts: string[] = [];
  if (!hideBottomNav) {
    parts.push("var(--rr-bottom-nav)");
  }
  parts.push("env(safe-area-inset-bottom, 0px)");
  return `calc(${parts.join(" + ")})`;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav = pathname === "/login";
  const offset = chromeOffset(hideBottomNav);

  return (
    <>
      <div
        className="min-h-full"
        data-rr-hide-nav={hideBottomNav ? "true" : "false"}
        style={
          {
            paddingBottom: offset,
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingLeft: "env(safe-area-inset-left, 0px)",
            paddingRight: "env(safe-area-inset-right, 0px)",
            "--rr-chrome-offset": offset,
          } as CSSProperties
        }
      >
        {children}
      </div>
      <MobileBottomNav />
    </>
  );
}
