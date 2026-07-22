import { describe, expect, it } from "vitest";
import { isTransparentColor, TRANSPARENT_COLOR } from "./color";

describe("isTransparentColor", () => {
  it("detects the transparent draw color sentinel", () => {
    expect(isTransparentColor(TRANSPARENT_COLOR)).toBe(true);
    expect(isTransparentColor("#ffffff")).toBe(false);
  });
});
