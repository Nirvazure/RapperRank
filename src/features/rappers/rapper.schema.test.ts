import { describe, expect, it } from "vitest";
import { rappersSchema } from "@/features/rappers/rapper.schema";
import { rappers } from "@/data/rappers";

describe("rapper schema", () => {
  it("validates the rapper mock dataset", () => {
    expect(() => rappersSchema.parse(rappers)).not.toThrow();
    expect(rappers.length).toBeGreaterThanOrEqual(80);
    expect(rappers.filter((rapper) => rapper.labels?.length).length).toBeGreaterThanOrEqual(25);
    expect(rappers.filter((rapper) => rapper.chineseName).length).toBeGreaterThanOrEqual(50);
    expect(rappers.find((rapper) => rapper.id === "drake")?.mediaUrl).toBe(
      "/rapper/drake.jpeg",
    );
  });
});
