import { describe, expect, it } from "vitest";
import {
  canonicalizeOssUrl,
  getStorageImageUrl,
  isStorageImageUrl,
  resolveStorageAssetUrl,
  STORAGE_PUBLIC_BASE_URL,
} from "./storage-media";

const image = `${STORAGE_PUBLIC_BASE_URL}/rapper/GAI.jpg`;

describe("storage media URLs", () => {
  it("canonicalizes encoded and unencoded Chinese keys without changing spaces", () => {
    expect(canonicalizeOssUrl("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/满舒克.jpg?x-oss-process=image/resize,w_800"))
      .toBe("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/%E6%BB%A1%E8%88%92%E5%85%8B.jpg");
    expect(canonicalizeOssUrl("https://rapperank.oss-cn-hangzhou.aliyuncs.com/music/TravisScott%20.m4a"))
      .toBe("https://rapperank.oss-cn-hangzhou.aliyuncs.com/music/TravisScott%20.m4a");
    expect(() => canonicalizeOssUrl("https://example.com/picture.jpg")).toThrow();
    expect(canonicalizeOssUrl("https://rapperank.oss-cn-hangzhou.aliyuncs.com/music/track.m4a "))
      .toBe("https://rapperank.oss-cn-hangzhou.aliyuncs.com/music/track.m4a%20");
  });

  it("uses the smallest pre-generated width and caps requests at 1200", () => {
    expect(getStorageImageUrl(image, 64)).toBe(`${STORAGE_PUBLIC_BASE_URL}/rapper/thumbs/GAI-w128.webp`);
    expect(getStorageImageUrl(image, 321)).toContain("/GAI-w800.webp");
    expect(getStorageImageUrl(image, 1600)).toContain("/GAI-w1200.webp");
    expect(getStorageImageUrl(`${STORAGE_PUBLIC_BASE_URL}/album/art/album%20(1).jpg`, 800))
      .toBe(`${STORAGE_PUBLIC_BASE_URL}/album/art/thumbs/album%20(1)-w800.webp`);
  });

  it("restricts managed images to this project, bucket, and original image folders", () => {
    expect(isStorageImageUrl(image)).toBe(true);
    expect(isStorageImageUrl(image.replace("/rapperank/", "/Artmind/"))).toBe(false);
    expect(isStorageImageUrl(image.replace("tfvzcuksahcofooqqezx", "otherproject"))).toBe(false);
    expect(isStorageImageUrl(`${STORAGE_PUBLIC_BASE_URL}/rapper/thumbs/GAI-w128.webp`)).toBe(false);
    expect(isStorageImageUrl(`${STORAGE_PUBLIC_BASE_URL}/music/gai.m4a`)).toBe(false);
    expect(getStorageImageUrl("/logo.png", 800)).toBe("/logo.png");
    expect(getStorageImageUrl("https://avatars.githubusercontent.com/u/1", 800)).toBe("https://avatars.githubusercontent.com/u/1");
  });

  it("keeps unmigrated and placeholder URLs unchanged", () => {
    expect(resolveStorageAssetUrl("pending-oss://rapper/missing.jpg")).toBe("pending-oss://rapper/missing.jpg");
    expect(resolveStorageAssetUrl("https://example.com/cover.jpg")).toBe("https://example.com/cover.jpg");
  });
});
