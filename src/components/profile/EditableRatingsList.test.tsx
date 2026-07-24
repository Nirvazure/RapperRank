import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditableRatingsList } from "@/components/profile/EditableRatingsList";
import type { ViewerRatingListResponse } from "@/features/ratings/rating.types";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/rapper/RapperAvatar", () => ({
  RapperAvatar: ({ rapper }: { rapper: { name: string } }) => <div>{rapper.name} avatar</div>,
}));

vi.mock("@/components/ratings/RatingDialog", () => ({
  RatingDialog: ({
    triggerLabel,
    onSubmit,
  }: {
    triggerLabel?: string;
    onSubmit: (submission: {
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
    }) => Promise<void>;
  }) => (
    <button
      type="button"
      onClick={() =>
        void onSubmit({
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
      {triggerLabel ?? "Rate"}
    </button>
  ),
}));

function createRatingsPage(overrides: Partial<ViewerRatingListResponse> = {}): ViewerRatingListResponse {
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
    page: 1,
    pageSize: 6,
    total: 9,
    totalPages: 2,
    ...overrides,
  };
}

describe("EditableRatingsList", () => {
  it("renders page metadata and pagination controls", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <EditableRatingsList
        ratingsPage={createRatingsPage()}
        onPageChange={onPageChange}
        onChangeRating={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText("My Ratings")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Next/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /Next/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("wires the edit action to the current rapper id", async () => {
    const user = userEvent.setup();
    const onChangeRating = vi.fn(async () => undefined);

    render(
      <EditableRatingsList
        ratingsPage={createRatingsPage({ page: 2, totalPages: 2 })}
        onPageChange={vi.fn()}
        onChangeRating={onChangeRating}
      />,
    );

    expect(screen.getByRole("button", { name: /Next/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "编辑" }));

    expect(onChangeRating).toHaveBeenCalledWith(
      "rapper-1",
      expect.objectContaining({
        fondness: 5,
      }),
    );
  });

  it("shows the empty state when there are no ratings", () => {
    render(
      <EditableRatingsList
        ratingsPage={createRatingsPage({
          items: [],
          total: 0,
          totalPages: 1,
        })}
        onPageChange={vi.fn()}
        onChangeRating={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText("No ratings yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start rating" })).toHaveAttribute("href", "/");
  });
});
