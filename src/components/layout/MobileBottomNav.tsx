"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, Library, MessageCircle, Shuffle } from "lucide-react";
import { getMainNavActive } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

const items = [
  { key: "rating" as const, href: "/", label: "评分", icon: Shuffle },
  { key: "community" as const, href: "/ranking", label: "社区", icon: MessageCircle },
  { key: "label" as const, href: "/label", label: "厂牌", icon: Library },
  { key: "art" as const, href: "/art", label: "Art", icon: Images },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  const active = getMainNavActive(pathname);

  return (
    <nav
      aria-label="主导航"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active[item.key];

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold tracking-[0.04em] transition focus-visible:outline-2 focus-visible:outline-lime-200 focus-visible:outline-offset-[-4px]",
                isActive ? "text-lime-200" : "text-white/55 hover:text-white",
              )}
            >
              <Icon className="size-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
