import { describe, expect, it } from "vitest";
import {
  VIRTUAL_SCREEN_HEIGHT,
  VIRTUAL_SCREEN_WIDTH,
  calculateVirtualScreenLayout,
} from "./virtualScreen";

describe("calculateVirtualScreenLayout", () => {
  it("uses integer scaling and centers the virtual screen", () => {
    const layout = calculateVirtualScreenLayout({
      viewportWidth: 1600,
      viewportHeight: 1000,
    });

    expect(layout).toEqual({
      width: VIRTUAL_SCREEN_WIDTH,
      height: VIRTUAL_SCREEN_HEIGHT,
      scale: 2,
      scaledWidth: VIRTUAL_SCREEN_WIDTH * 2,
      scaledHeight: VIRTUAL_SCREEN_HEIGHT * 2,
      offsetX: 160,
      offsetY: 20,
    });
  });

  it("does not scale below 1 for small viewports", () => {
    expect(
      calculateVirtualScreenLayout({
        viewportWidth: 320,
        viewportHeight: 240,
      }).scale
    ).toBe(1);
  });
});
