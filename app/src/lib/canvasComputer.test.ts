import { describe, expect, it } from "vitest";
import {
  CANVAS_COMPUTER_HEIGHT,
  CANVAS_COMPUTER_WIDTH,
  MACINTOSH_1984_PALETTE,
  getMenuAtPoint,
  getWindowDragHandle,
  moveWindowByPointer,
  quantizeToMacintoshPalette,
  screenPointToCanvasPoint,
} from "./canvasComputer";

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

describe("quantizeToMacintoshPalette", () => {
  it("uses the original 1-bit Macintosh black-white palette", () => {
    expect(MACINTOSH_1984_PALETTE).toEqual(["#000000", "#ffffff"]);
    expect(quantizeToMacintoshPalette("#1f1f1f")).toBe("#000000");
    expect(quantizeToMacintoshPalette("#e0e0e0")).toBe("#ffffff");
  });
});
