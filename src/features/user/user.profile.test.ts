import { describe, expect, it } from "vitest";
import { buildProfileFromAuthUser } from "@/features/user/user.profile";

describe("buildProfileFromAuthUser", () => {
  it("prefers full_name from metadata", () => {
    const profile = buildProfileFromAuthUser({
      id: "user-1",
      email: "dev@example.com",
      user_metadata: {
        full_name: "GitHub User",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
      },
    } as never);

    expect(profile).toEqual({
      displayName: "GitHub User",
      avatarUrl: "https://avatars.githubusercontent.com/u/1",
    });
  });

  it("falls back to email prefix", () => {
    const profile = buildProfileFromAuthUser({
      id: "user-1",
      email: "rapper@example.com",
      user_metadata: {},
    } as never);

    expect(profile.displayName).toBe("rapper");
  });
});
