import { describe, expect, it } from "vitest";
import { rappersSchema } from "@/features/rappers/rapper.schema";
import { rappers } from "@/data/rappers";

describe("rapper schema", () => {
  it("validates the ten rapper mock dataset", () => {
    expect(() => rappersSchema.parse(rappers)).not.toThrow();
    expect(rappers).toHaveLength(10);
  });
});
