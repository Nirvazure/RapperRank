import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import type { ViewerRatingListResponse } from "@/features/ratings/rating.types";

const refreshMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("gsap", () => ({
  default: {
    context: (callback: () => void) => {
      callback();
      return {
        revert: vi.fn(),
      };
    },
    fromTo: vi.fn(),
    to: vi.fn(),
  },
}));

vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: () => <div>Page Header</div>,
}));

vi.mock("@/components/profile/EditableRatingsList", () => ({
  EditableRatingsList: ({
    ratingsPage,
    onPageChange,
    onChangeRating,
  }: {
    ratingsPage: ViewerRatingListResponse;
    onPageChange: (page: number) => void;
    onChangeRating: (
      rapperId: string,
      submission: {
        ratings: {
          flow: number;
          lyrics: number;
          voice: number;
          technique: number;
          melody: number;
          stage: number;
          ph: number;
        };
        fondness: number | null;
      },
    ) => Promise<void>;
  }) => (
    <div>
      <div data-testid="active-page">{ratingsPage.page}</div>
      <div data-testid="ratings-total">{ratingsPage.total}</div>
      <button type="button" onClick={() => onPageChange(2)}>
        load-page-2
      </button>
      <button
        type="button"
        onClick={() =>
          void onChangeRating("rapper-1", {
            ratings: {
              flow: 5,
              lyrics: 4,
              voice: 4,
              technique: 5,
              melody: 3,
              stage: 4,
              ph: 1,
            },
            fondness: 5,
          })
        }
      >
        edit-rating
      </button>
    </div>
  ),
}));

function createRatingsPage(page: number, total = 11): ViewerRatingListResponse {
  return {
    items: [
      {
        rating: {
          userId: "viewer-1",
          rapperId: "rapper-1",
          ratings: {
            flow: 5,
            lyrics: 4,
            voice: 4,
            technique: 5,
            melody: 3,
            stage: 4,
            ph: 1,
          },
          fondness: 5,
          createdAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-02T00:00:00.000Z",
        },
        rapper: {
          id: "rapper-1",
          name: "Rapper One",
          region: "CN",
          avatarUrl: "https://example.com/1.jpg",
          mediaUrl: "https://example.com/1.jpg",
          mediaType: "image",
        },
      },
    ],
    page,
    pageSize: 6,
    total,
    totalPages: 2,
  };
}

describe("FavoritesPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns to page one after editing from a later page", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createRatingsPage(2)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createRatingsPage(1, 12)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(
      <FavoritesPageClient
        favoriteRappers={[]}
        ratingsPage={createRatingsPage(1, 11)}
        viewer={{
          displayName: "viewer",
          isAuthenticated: true,
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "load-page-2" }));

    await waitFor(() => {
      expect(screen.getByTestId("active-page")).toHaveTextContent("2");
    });

    await user.click(screen.getByRole("button", { name: "edit-rating" }));

    await waitFor(() => {
      expect(screen.getByTestId("active-page")).toHaveTextContent("1");
      expect(screen.getByTestId("ratings-total")).toHaveTextContent("12");
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/me/ratings?page=2&pageSize=6",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/ratings",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/me/ratings?page=1&pageSize=6",
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
