import { describe, expect, it } from "vitest";
import { quantizeImageDataToPalette } from "pixel-paint";
import {
  DEFAULT_PAINT_PALETTE_ID,
  PAINT_APP_PALETTE,
  PAINT_APP_PALETTE_IDS,
  PAINT_APP_PALETTES,
  quantizeToPaintPalette,
} from "./palette";

describe("PAINT_APP_PALETTE", () => {
  it("defines four named 16-color palettes", () => {
    expect(DEFAULT_PAINT_PALETTE_ID).toBe("toybox");
    expect(PAINT_APP_PALETTE_IDS).toEqual([
      "toybox",
      "watercolor",
      "arcade",
      "systemGarden",
    ]);

    for (const id of PAINT_APP_PALETTE_IDS) {
      const palette = PAINT_APP_PALETTES[id];
      expect(palette.name).toBeTruthy();
      expect(palette.colors).toHaveLength(16);
      expect(new Set(palette.colors).size).toBe(16);
      expect(palette.colors).toContain("#000000");
      expect(palette.colors).toContain("#ffffff");
    }
  });

  it("maps arbitrary colors to the canonical paint palette", () => {
    expect(PAINT_APP_PALETTE).toHaveLength(16);
    expect(quantizeToPaintPalette("#fdfdfd")).toBe("#ffffff");
    expect(quantizeToPaintPalette("#120f0d")).toBe("#000000");
    expect(quantizeToPaintPalette("#f12a10")).toBe("#e84646");
    expect(quantizeToPaintPalette("nope")).toBe("#000000");
  });

  it("quantizes imported image data into the same palette", () => {
    const imageData = {
      data: new Uint8ClampedArray([
        241, 42, 16, 255,
        250, 250, 250, 255,
        12, 240, 20, 255,
        0, 0, 0, 0,
      ]),
    } as ImageData;

    quantizeImageDataToPalette(imageData, PAINT_APP_PALETTE);

    expect(Array.from(imageData.data)).toEqual([
      232, 70, 70, 255,
      255, 255, 255, 255,
      95, 211, 111, 255,
      255, 255, 255, 255,
    ]);
  });
});
