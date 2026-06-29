import type { User as AuthUser } from "@supabase/supabase-js";
import { UserKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildProfileFromAuthUser } from "@/features/user/user.profile";

export async function ensureAuthenticatedUser(authUser: AuthUser) {
  const profile = buildProfileFromAuthUser(authUser);

  return prisma.user.upsert({
    where: { authUserId: authUser.id },
    create: {
      kind: UserKind.AUTHENTICATED,
      authUserId: authUser.id,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
    update: {
      kind: UserKind.AUTHENTICATED,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      authUserId: true,
    },
  });
}
