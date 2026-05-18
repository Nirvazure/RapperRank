import { describe, expect, it } from "vitest";
import { rappers } from "@/data/rappers";
import { rapperSchema, rappersSchema } from "@/features/rappers/rapper.schema";

describe("rapper schema", () => {
  it("validates the rapper mock dataset", () => {
    expect(() => rappersSchema.parse(rappers)).not.toThrow();
    expect(rappers.length).toBeGreaterThan(0);
    expect(rappers.every((rapper) => rapper.tags.length > 0)).toBe(true);
    expect(rappers.every((rapper) => rapper.representativeWorks.length > 0)).toBe(true);
    expect(
      rappers.every(
        (rapper) =>
          !rapper.mediaUrl ||
          rapper.mediaUrl.startsWith("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/"),
      ),
    ).toBe(true);
    expect(
      rappers.every(
        (rapper) =>
          !rapper.avatarUrl ||
          rapper.avatarUrl.startsWith("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/"),
      ),
    ).toBe(true);
    expect(rappers.some((rapper) => !rapper.mediaUrl)).toBe(true);
    expect(rappers.some((rapper) => !rapper.avatarUrl)).toBe(true);
    expect(rappers.some((rapper) => rapper.mediaUrl?.startsWith("/rapper/"))).toBe(false);
  });

  it("accepts an OSS-hosted image and optional avatar", () => {
    expect(() =>
      rapperSchema.parse({
        id: "test",
        name: "Test",
        region: "Nowhere",
        mediaUrl: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test.webp",
        mediaType: "image",
        bio: "bio",
        shortReview: "review",
        tags: ["tag"],
        representativeWorks: ["song"],
        ratingCount: 0,
        averageRatings: {
          flow: 4,
          lyrics: 4,
          voice: 4,
          technique: 4,
          melody: 4,
          stage: 4,
          ph: 0,
        },
      }),
    ).not.toThrow();
  });

  it("rejects a local public image path", () => {
    expect(() =>
      rapperSchema.parse({
        id: "test",
        name: "Test",
        region: "Nowhere",
        mediaUrl: "/rapper/test.webp",
        mediaType: "image",
        bio: "bio",
        shortReview: "review",
        tags: ["tag"],
        representativeWorks: ["song"],
        ratingCount: 0,
        averageRatings: {
          flow: 4,
          lyrics: 4,
          voice: 4,
          technique: 4,
          melody: 4,
          stage: 4,
          ph: 0,
        },
      }),
    ).toThrow();
  });

  it("accepts missing image values during OSS migration", () => {
    expect(() =>
      rapperSchema.parse({
        id: "test",
        name: "Test",
        region: "Nowhere",
        mediaType: "image",
        bio: "bio",
        shortReview: "review",
        tags: ["tag"],
        representativeWorks: ["song"],
        ratingCount: 0,
        averageRatings: {
          flow: 4,
          lyrics: 4,
          voice: 4,
          technique: 4,
          melody: 4,
          stage: 4,
          ph: 0,
        },
      }),
    ).not.toThrow();
  });
});
