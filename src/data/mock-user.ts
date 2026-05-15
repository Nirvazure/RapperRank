import { mockUserSchema } from "@/features/user/user.schema";
import type { MockUser } from "@/features/user/user.types";
import { MOCK_USER_ID } from "@/lib/constants";

const now = "2026-05-08T00:00:00.000Z";

const rawMockUser: MockUser = {
  id: MOCK_USER_ID,
  displayName: "Local Head",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80",
  favoriteRapperIds: ["kendrick-lamar", "nicki-minaj", "travis-scott"],
  ratings: [
    {
      userId: MOCK_USER_ID,
      rapperId: "kendrick-lamar",
      ratings: { flow: 5, lyrics: 5, voice: 4.5, technique: 5, melody: 4, stage: 5, ph: -1 },
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: MOCK_USER_ID,
      rapperId: "travis-scott",
      ratings: { flow: 4, lyrics: 3.5, voice: 5, technique: 3.5, melody: 5, stage: 5, ph: 1 },
      createdAt: now,
      updatedAt: now,
    },
  ],
};

export const mockUser = mockUserSchema.parse(rawMockUser);
