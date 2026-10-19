import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StorageImage } from "./StorageImage";
import { STORAGE_PUBLIC_BASE_URL } from "@/lib/storage-media";

afterEach(cleanup);

describe("StorageImage", () => {
  it("serves managed image variants directly even if a caller requests unoptimized", () => {
    render(<StorageImage src={`${STORAGE_PUBLIC_BASE_URL}/rapper/GAI.jpg`} alt="cover" width={160} height={160} unoptimized />);
    const image = screen.getByAltText("cover");
    expect(image.getAttribute("src")).toContain("/rapper/thumbs/");
    expect(image.getAttribute("srcSet")).toContain("/GAI-w320.webp");
    expect(image.getAttribute("srcSet")).not.toContain("/_next/image");
    expect(image.getAttribute("srcSet")).not.toContain("/render/image");
  });

  it("keeps legacy OSS readable during deployment before the database switches", () => {
    const src = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/unmapped.jpg";
    render(<StorageImage src={src} alt="legacy" width={160} height={160} />);
    expect(screen.getByAltText("legacy")).toHaveAttribute("src", src);
    expect(screen.getByAltText("legacy")).not.toHaveAttribute("srcset");
  });
});
