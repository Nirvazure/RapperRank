import { describe, expect, it } from "vitest";
import {
  resolveRapperAvatar,
  resolveRapperMedia,
} from "@/features/rappers/rapper.media";

describe("rapper media", () => {
  it("returns dedicated avatar when present", () => {
    expect(
      resolveRapperAvatar({
        name: "Test",
        avatarUrl: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test-avatar.webp",
        mediaUrl: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test-media.webp",
      }),
    ).toEqual({
      src: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test-avatar.webp",
      alt: "Test",
      isPlaceholder: false,
    });
  });

  it("falls back to media for avatar when dedicated avatar is missing", () => {
    expect(
      resolveRapperAvatar({
        name: "Test",
        mediaUrl: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test-media.webp",
      }),
    ).toEqual({
      src: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test-media.webp",
      alt: "Test",
      isPlaceholder: false,
    });
  });

  it("returns placeholder state when both avatar and media are missing", () => {
    expect(resolveRapperAvatar({ name: "Test" })).toEqual({
      src: undefined,
      alt: "Test",
      isPlaceholder: true,
    });
  });

  it("returns placeholder state when primary media is missing", () => {
    expect(resolveRapperMedia({ name: "Test" })).toEqual({
      src: undefined,
      alt: "Test visual",
      isPlaceholder: true,
    });
  });
});
