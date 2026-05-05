import { describe, expect, it } from "vitest";
import {
  CANVAS_COMPUTER_HEIGHT,
  CANVAS_COMPUTER_WIDTH,
  INDEXED_16_COLOR_PALETTE,
  calculateCanvasComputerLayout,
  getMenuAtPoint,
  getWindowDragHandle,
  clampWindowPosition,
  moveWindowByPointer,
  quantizeToIndexedPalette,
  getPaletteIndexAtPoint,
  screenPointToCanvasPoint,
} from "./canvasComputer";

describe("calculateCanvasComputerLayout", () => {
  it("uses the largest integer scale that fits the screen and monitor", () => {
    expect(
      calculateCanvasComputerLayout({
        viewportWidth: 1500,
        viewportHeight: 900,
      })
    ).toEqual({
      scale: 2,
      width: CANVAS_COMPUTER_WIDTH * 2,
      height: CANVAS_COMPUTER_HEIGHT * 2,
    });
  });

  it("accounts for the monitor bezel instead of clipping vertically", () => {
    expect(
      calculateCanvasComputerLayout({
        viewportWidth: 1500,
        viewportHeight: 760,
      }).scale
    ).toBe(1);
  });
});

describe("screenPointToCanvasPoint", () => {
  it("maps scaled screen coordinates into the fixed canvas resolution", () => {
    expect(
      screenPointToCanvasPoint({
        clientX: 740,
        clientY: 520,
        rect: {
          left: 100,
          top: 40,
          width: CANVAS_COMPUTER_WIDTH * 2,
          height: CANVAS_COMPUTER_HEIGHT * 2,
        },
      })
    ).toEqual({ x: 320, y: 240 });
  });
});

describe("getMenuAtPoint", () => {
  it("hits menu bar labels by canvas coordinates", () => {
    expect(getMenuAtPoint({ x: 42, y: 10 })).toBe("file");
    expect(getMenuAtPoint({ x: 78, y: 10 })).toBe("edit");
    expect(getMenuAtPoint({ x: 120, y: 10 })).toBe("view");
    expect(getMenuAtPoint({ x: 220, y: 10 })).toBeNull();
  });
});

describe("getWindowDragHandle", () => {
  it("returns titlebar drag handles for canvas windows", () => {
    expect(
      getWindowDragHandle(
        { x: 180, y: 42 },
        [
          {
            id: "paint",
            x: 170,
            y: 28,
            width: 450,
            height: 330,
            title: "Untitled",
          },
        ]
      )
    ).toBe("paint");
  });
});

describe("moveWindowByPointer", () => {
  it("moves windows in fixed-resolution canvas coordinates", () => {
    expect(
      moveWindowByPointer({
        startWindow: { x: 15, y: 30 },
        startPointer: { x: 25, y: 40 },
        currentPointer: { x: 80, y: 70 },
      })
    ).toEqual({ x: 70, y: 60 });
  });
});

describe("clampWindowPosition", () => {
  it("keeps windows inside the fixed screen", () => {
    expect(
      clampWindowPosition({
        position: { x: -20, y: 600 },
        size: { width: 100, height: 80 },
      })
    ).toEqual({ x: 4, y: CANVAS_COMPUTER_HEIGHT - 80 - 24 });
  });
});

describe("quantizeToIndexedPalette", () => {
  it("uses a curated 16 color indexed paint palette", () => {
    expect(INDEXED_16_COLOR_PALETTE).toHaveLength(16);
    expect(new Set(INDEXED_16_COLOR_PALETTE).size).toBe(16);
    expect(INDEXED_16_COLOR_PALETTE).toContain("#000000");
    expect(INDEXED_16_COLOR_PALETTE).toContain("#ffffff");
    expect(INDEXED_16_COLOR_PALETTE).toContain("#00aa00");
    expect(INDEXED_16_COLOR_PALETTE).toContain("#0088ff");
    expect(INDEXED_16_COLOR_PALETTE).toContain("#663300");
    expect(quantizeToIndexedPalette("#fefefe")).toBe("#ffffff");
    expect(quantizeToIndexedPalette("#010101")).toBe("#000000");
  });
});

describe("getPaletteIndexAtPoint", () => {
  it("matches the visible palette swatch grid", () => {
    const input = {
      windowPosition: { x: 14, y: 32 },
      colorCount: INDEXED_16_COLOR_PALETTE.length,
    };

    expect(getPaletteIndexAtPoint({ ...input, point: { x: 31, y: 180 } })).toBe(0);
    expect(getPaletteIndexAtPoint({ ...input, point: { x: 85, y: 180 } })).toBe(3);
    expect(getPaletteIndexAtPoint({ ...input, point: { x: 31, y: 234 } })).toBe(12);
  });
});
