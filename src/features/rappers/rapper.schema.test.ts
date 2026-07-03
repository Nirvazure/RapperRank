import { describe, expect, it } from "vitest";
import { rappers } from "@/data/rappers";
import { rapperSeedSchema, rapperSeedRecordsSchema } from "@/features/rappers/rapper.schema";

describe("rapper schema", () => {
  it("validates the rapper mock dataset", () => {
    expect(() => rapperSeedRecordsSchema.parse(rappers)).not.toThrow();
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
      rapperSeedSchema.parse({
        seedKey: "test",
        name: "Test",
        aliases: [],
        region: "Nowhere",
        mediaUrl: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test.webp",
        mediaType: "image",
        bio: "bio",
        tags: ["tag"],
        representativeWorks: ["song"],
      }),
    ).not.toThrow();
  });

  it("rejects a local public image path", () => {
    expect(() =>
      rapperSeedSchema.parse({
        seedKey: "test",
        name: "Test",
        aliases: [],
        region: "Nowhere",
        mediaUrl: "/rapper/test.webp",
        mediaType: "image",
        bio: "bio",
        tags: ["tag"],
        representativeWorks: ["song"],
      }),
    ).toThrow();
  });

  it("accepts missing image values during OSS migration", () => {
    expect(() =>
      rapperSeedSchema.parse({
        seedKey: "test",
        name: "Test",
        aliases: [],
        region: "Nowhere",
        mediaType: "image",
        bio: "bio",
        tags: ["tag"],
        representativeWorks: ["song"],
      }),
    ).not.toThrow();
  });
});
