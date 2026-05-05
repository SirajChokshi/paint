import { describe, expect, it } from "vitest";
import {
  calculateCanvasPoint,
  calculateDragPosition,
  calculateVirtualScreenLayout,
  calculateScaledDelta,
  snapPointToGrid,
} from "./virtualScreen";

describe("calculateVirtualScreenLayout", () => {
  it("letterboxes with contain scaling so one axis is flush", () => {
    const layout = calculateVirtualScreenLayout({
      viewportWidth: 1440,
      viewportHeight: 960,
      width: 512,
      height: 342,
    });

    expect(layout.width).toBe(512);
    expect(layout.height).toBe(342);
    expect(layout.scale).toBeCloseTo(960 / 342, 10);
    expect(layout.scaledHeight).toBeCloseTo(960, 5);
    expect(layout.scaledWidth).toBeCloseTo(512 * layout.scale, 5);
    expect(layout.offsetY).toBeCloseTo(0, 5);
    expect(layout.offsetX).toBeGreaterThan(0);
    expect(layout.offsetX).toBeLessThan(2);
  });

  it("shrinks below 1x when the viewport is smaller than the logical screen", () => {
    const layout = calculateVirtualScreenLayout({
      viewportWidth: 320,
      viewportHeight: 240,
      width: 512,
      height: 342,
    });

    expect(layout.scale).toBeCloseTo(320 / 512, 10);
    expect(layout.scaledWidth).toBeCloseTo(320, 5);
    expect(layout.offsetX).toBeCloseTo(0, 5);
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

  it("returns an absolute position, not a delta", () => {
    expect(
      calculateDragPosition({
        startPosition: { x: 140, y: 12 },
        startPointer: { x: 300, y: 100 },
        currentPointer: { x: 500, y: 180 },
        scale: 2,
      })
    ).toEqual({
      x: 240,
      y: 52,
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
