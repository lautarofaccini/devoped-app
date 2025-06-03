import { describe, it, expect } from "vitest";
import { canReconfigure } from "../src/canReconfigure";

describe("canReconfigure", () => {
  it("should throw if first parameter is not a string", () => {
    expect(() => canReconfigure(3)).toThrow();
  });

  it("should throw if second parameter is not a string", () => {
    expect(() => canReconfigure("hello", 3)).toThrow();
  });

  it("should return false if strings provided have different length", () => {
    expect(canReconfigure("hello", "he")).toBe(false);
  });

  it("should return false if strings provided have different number of unique letters", () => {
    expect(canReconfigure("AAB", "ABC")).toBe(false);
  });

  it("should return false if strings provided have different number of unique letters even if have different length", () => {
    expect(canReconfigure("AAB", "AB")).toBe(false);
  });

  it("should return false if strings have different order of transformation", () => {
    expect(canReconfigure("XBOX", "XXBO")).toBe(false);
  });
});
