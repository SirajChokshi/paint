import { describe, expect, it } from "vitest";
import {
  VIRTUAL_SCREEN_HEIGHT,
  VIRTUAL_SCREEN_WIDTH,
  calculateCanvasPoint,
  calculateDragPosition,
  calculateScaledDelta,
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

describe("calculateScaledDelta", () => {
  it("converts viewport movement into virtual-screen movement", () => {
    expect(calculateScaledDelta({ x: 80, y: 40 }, 2)).toEqual({
      x: 40,
      y: 20,
    });
  });
});

describe("calculateDragPosition", () => {
  it("moves a window in virtual-screen coordinates", () => {
    expect(
      calculateDragPosition({
        startPosition: { x: 15, y: 15 },
        startPointer: { x: 200, y: 180 },
        currentPointer: { x: 280, y: 220 },
        scale: 2,
      })
    ).toEqual({
      x: 55,
      y: 35,
    });
  });
});

describe("calculateCanvasPoint", () => {
  it("maps pointer coordinates through a scaled canvas rect", () => {
    expect(
      calculateCanvasPoint({
        canvasWidth: 435,
        canvasHeight: 290,
        rect: {
          left: 460,
          top: 120,
          width: 870,
          height: 580,
        },
        clientX: 660,
        clientY: 320,
      })
    ).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("rounds mapped coordinates to avoid floating point drift", () => {
    expect(
      calculateCanvasPoint({
        canvasWidth: 435,
        canvasHeight: 290,
        rect: {
          left: 460,
          top: 120,
          width: 870.00001,
          height: 580.00001,
        },
        clientX: 660,
        clientY: 320,
      })
    ).toEqual({
      x: 100,
      y: 100,
    });
  });
});
