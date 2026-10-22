import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/server/viewer";
import { GitHubLoginButton } from "@/components/auth/GitHubLoginButton";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const viewer = await getViewer();

  if (viewer.isAuthenticated) {
    redirect("/favorites");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-var(--rr-chrome-offset,0px))] max-w-md flex-col justify-center px-4 py-8 sm:px-6 sm:py-16">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-white sm:p-8">
        <h1 className="text-center text-2xl font-black uppercase">登录 RapperRank</h1>
        <p className="mt-3 text-center text-sm font-bold leading-6 text-white/60">
          使用 GitHub 账号登录，同步评分与收藏记录
        </p>
        <div className="mt-8">
          <GitHubLoginButton />
        </div>
        <p className="mt-6 text-center text-xs text-white/45">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center px-2 text-sm underline underline-offset-2 hover:text-white/70 sm:min-h-0 sm:text-xs">
            继续以匿名用户浏览
          </Link>
        </p>
      </div>
    </main>
  );
}
