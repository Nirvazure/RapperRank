import { describe, expect, it } from "vitest";
import { normalizeRapperImageUrl } from "@/features/rappers/rapper.media";

describe("rapper media", () => {
  it("normalizes local rapper paths to OSS URLs", () => {
    expect(normalizeRapperImageUrl("/rapper/drake.jpeg")).toBe(
      "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/drake.jpeg",
    );
  });

  it("keeps existing OSS URLs unchanged", () => {
    const url = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/test.webp";
    expect(normalizeRapperImageUrl(url)).toBe(url);
  });

  it("returns undefined for unsupported URLs", () => {
    expect(normalizeRapperImageUrl("https://example.com/image.jpg")).toBeUndefined();
    expect(normalizeRapperImageUrl(undefined)).toBeUndefined();
  });
});
