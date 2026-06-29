import { cookies } from "next/headers";
import { getAnonymousViewer } from "@/lib/server/auth-anonymous";
import { getAuthUser } from "@/lib/server/auth";
import { ensureAuthenticatedUser } from "@/features/user/user.repository";
import {
  getAnonymousSessionTokenFromCookieValue,
  mergeAnonymousIntoAuthenticated,
  SESSION_COOKIE_NAME,
} from "@/features/user/user.merge";

export type Viewer = {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
  sessionToken?: string;
};

export async function getViewer(): Promise<Viewer> {
  const authUser = await getAuthUser();

  if (authUser) {
    const cookieStore = await cookies();
    const anonymousSessionToken = getAnonymousSessionTokenFromCookieValue(
      cookieStore.get(SESSION_COOKIE_NAME)?.value,
    );

    const user = await ensureAuthenticatedUser(authUser);
    await mergeAnonymousIntoAuthenticated(user.id, anonymousSessionToken);

    return {
      userId: user.id,
      displayName: user.displayName ?? "用户",
      avatarUrl: user.avatarUrl ?? undefined,
      isAuthenticated: true,
    };
  }

  const anonymous = await getAnonymousViewer();

  return {
    userId: anonymous.userId,
    displayName: "",
    isAuthenticated: false,
    sessionToken: anonymous.sessionToken,
  };
}
