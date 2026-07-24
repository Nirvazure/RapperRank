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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active[item.key];

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase tracking-[0.08em] transition",
                isActive ? "text-lime-200" : "text-white/55 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
