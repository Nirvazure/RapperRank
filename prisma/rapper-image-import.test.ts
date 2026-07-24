import { describe, expect, it } from "vitest";
import {
  buildRapperImageUrl,
  PENDING_RAPPER_IMAGE_BASE_URL,
  planRapperImageImports,
} from "./rapper-image-import";

describe("rapper image import planning", () => {
  it("builds pending placeholder URLs by default", () => {
    expect(buildRapperImageUrl("kendrick.jpg")).toBe(`${PENDING_RAPPER_IMAGE_BASE_URL}kendrick.jpg`);
  });

  it("joins custom base URLs without duplicate slashes", () => {
    expect(buildRapperImageUrl("kendrick.jpg", "https://example.com/rapper/")).toBe(
      "https://example.com/rapper/kendrick.jpg",
    );
  });

  it("matches seed keys before names and builds media updates", () => {
    const result = planRapperImageImports([
      {
        id: "1",
        seedKey: "kendrick-lamar",
        name: "Kendrick Lamar",
        aliases: ["K-Dot"],
        mediaUrl: null,
        avatarUrl: null,
      },
    ]);

    const item = result.planned.find((entry) => entry.entry.fileName === "kendrick.jpg");
    expect(item).toMatchObject({
      matchType: "seedKey",
      nextMediaUrl: "pending-oss://rapper/kendrick.jpg",
      nextAvatarUrl: null,
    });
    expect(result.issues).toHaveLength(15);
  });

  it("falls back to name matching for chinese records without seed keys", () => {
    const result = planRapperImageImports([
      {
        id: "1",
        seedKey: null,
        name: "满舒克",
        aliases: [],
        mediaUrl: null,
        avatarUrl: null,
      },
    ]);

    const item = result.planned.find((entry) => entry.entry.fileName === "满舒克.jpg");
    expect(item?.matchType).toBe("name");
  });

  it("reports ambiguous matches", () => {
    const result = planRapperImageImports([
      {
        id: "1",
        seedKey: "boom",
        name: "Boom",
        aliases: [],
        mediaUrl: null,
        avatarUrl: null,
      },
      {
        id: "2",
        seedKey: "boom",
        name: "Boom 2",
        aliases: [],
        mediaUrl: null,
        avatarUrl: null,
      },
    ]);

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        reason: "ambiguous",
        matchType: "seedKey",
        entry: expect.objectContaining({ fileName: "boom.jpg" }),
      }),
    );
  });
});
