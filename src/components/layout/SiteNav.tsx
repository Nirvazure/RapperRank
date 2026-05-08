"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: UserRound },
  { href: "/ranking", label: "Top 10", icon: Trophy },
  { href: "/favorites", label: "我的收藏", icon: Heart },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 px-4 py-3 text-white shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          href="/"
          className="font-mono text-sm font-black uppercase tracking-[0.28em] text-lime-200"
        >
          RapperRank
        </Link>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-black uppercase transition sm:px-3",
                  active
                    ? "bg-lime-200 text-black"
                    : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
