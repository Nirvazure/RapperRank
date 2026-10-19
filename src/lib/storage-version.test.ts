import { describe, expect, it } from "vitest";
import { storageVersion } from "./storage-version";

describe("deployed storage mapping fingerprint", () => {
  it("ignores key ordering and changes when any target changes", () => {
    expect(storageVersion({ b: "two", a: "one" })).toEqual(storageVersion({ a: "one", b: "two" }));
    expect(storageVersion({ a: "one" }).mappingSha256).not.toBe(storageVersion({ a: "other" }).mappingSha256);
  });
});
