import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(),
  getViewerRatingsPage: vi.fn(),
}));

vi.mock("@/lib/server/viewer", () => ({
  getViewer: mocks.getViewer,
}));

vi.mock("@/features/user/user.server", () => ({
  getViewerRatingsPage: mocks.getViewerRatingsPage,
}));

import { GET } from "@/app/api/me/ratings/route";

describe("GET /api/me/ratings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getViewer.mockResolvedValue({ userId: "viewer-1" });
    mocks.getViewerRatingsPage.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 6,
      total: 0,
      totalPages: 1,
    });
  });

  it("uses the default paging params when none are provided", async () => {
    const response = await GET(new Request("https://example.com/api/me/ratings"));

    expect(mocks.getViewerRatingsPage).toHaveBeenCalledWith("viewer-1", 1, 6);
    await expect(response.json()).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 6,
      total: 0,
      totalPages: 1,
    });
  });

  it("falls back to defaults for invalid page params", async () => {
    await GET(new Request("https://example.com/api/me/ratings?page=-2&pageSize=abc"));

    expect(mocks.getViewerRatingsPage).toHaveBeenCalledWith("viewer-1", 1, 6);
  });
});
