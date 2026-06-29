import type { User } from "@supabase/supabase-js";

export function buildProfileFromAuthUser(authUser: User) {
  const meta = authUser.user_metadata as Record<string, string | undefined> | undefined;

  return {
    displayName:
      meta?.full_name ??
      meta?.name ??
      meta?.user_name ??
      authUser.email?.split("@")[0] ??
      "用户",
    avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
  };
}
