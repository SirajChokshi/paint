import { describe, expect, it } from "vitest";
import {
  calculateCanvasPoint,
  calculateDragPosition,
  calculateVirtualScreenLayout,
  mapViewportPointToVirtualScreen,
  pointsBetween,
  calculateScaledDelta,
  snapPointToGrid,
} from "./virtualScreen";

describe("calculateVirtualScreenLayout", () => {
  it("uses integer scaling for any requested resolution", () => {
    const layout = calculateVirtualScreenLayout({
      viewportWidth: 1440,
      viewportHeight: 960,
      width: 512,
      height: 342,
    });

    expect(layout).toEqual({
      width: 512,
      height: 342,
      scale: 2,
      scaledWidth: 1024,
      scaledHeight: 684,
      offsetX: 208,
      offsetY: 138,
    });
  });

  it("does not scale below 1 for small viewports", () => {
    expect(
      calculateVirtualScreenLayout({
        viewportWidth: 320,
        viewportHeight: 240,
        width: 512,
        height: 342,
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

  it("keeps the grabbed point under the pointer at 2x screen scale", () => {
    expect(
      calculateDragPosition({
        startPosition: { x: 14, y: 12 },
        startPointer: { x: 300, y: 240 },
        currentPointer: { x: 368, y: 290 },
        scale: 2,
      })
    ).toEqual({
      x: 48,
      y: 37,
    });
  });
});

describe("mapViewportPointToVirtualScreen", () => {
  it("maps visible framebuffer coordinates back to virtual-screen coordinates", () => {
    expect(
      mapViewportPointToVirtualScreen({
        clientX: 500,
        clientY: 300,
        width: 512,
        height: 342,
        rect: {
          left: 180,
          top: 60,
          width: 1024,
          height: 684,
        },
      })
    ).toEqual({
      x: 160,
      y: 120,
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

describe("snapPointToGrid", () => {
  it("snaps a canvas point to the active brush grid", () => {
    expect(snapPointToGrid({ x: 103, y: 117 }, 5)).toEqual({
      x: 100,
      y: 115,
    });
  });
});

describe("pointsBetween", () => {
  it("returns contiguous grid points between two brush cells", () => {
    expect(pointsBetween({ x: 0, y: 0 }, { x: 15, y: 10 }, 5)).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 5 },
      { x: 15, y: 10 },
    ]);
  });
});
