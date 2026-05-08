import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-5 py-8 text-white">
          正在加载 RapperRank...
        </main>
      }
    >
      <AppShell />
    </Suspense>
  );
}
