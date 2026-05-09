import { describe, expect, it } from "vitest";
import { PAINT_APP_PALETTES } from "./palette";
import {
  AUTOPALETTE_COLOR_COUNT,
  AUTOPALETTE_MIN_DISTANCE,
  createAutopaletteFromImageData,
  getAutopaletteColorDistance,
} from "./autopalette";

function makeImageData(colors: string[]): ImageData {
  const data = new Uint8ClampedArray(colors.length * 4);

  colors.forEach((color, index) => {
    const offset = index * 4;
    data[offset] = Number.parseInt(color.slice(1, 3), 16);
    data[offset + 1] = Number.parseInt(color.slice(3, 5), 16);
    data[offset + 2] = Number.parseInt(color.slice(5, 7), 16);
    data[offset + 3] = 255;
  });

  return {
    data,
    width: colors.length,
    height: 1,
  } as ImageData;
}

function repeat(color: string, count: number): string[] {
  return Array.from({ length: count }, () => color);
}

function expectDistinctPalette(colors: readonly string[]) {
  expect(colors).toHaveLength(AUTOPALETTE_COLOR_COUNT);
  expect(new Set(colors).size).toBe(AUTOPALETTE_COLOR_COUNT);

  for (let outerIndex = 0; outerIndex < colors.length; outerIndex += 1) {
    for (let innerIndex = outerIndex + 1; innerIndex < colors.length; innerIndex += 1) {
      expect(getAutopaletteColorDistance(colors[outerIndex], colors[innerIndex])).toBeGreaterThanOrEqual(
        AUTOPALETTE_MIN_DISTANCE,
      );
    }
  }
}

describe("createAutopaletteFromImageData", () => {
  it("creates a distinct 16-color palette from image samples", () => {
    const imageData = makeImageData([
      ...repeat("#102030", 48),
      ...repeat("#c83a24", 42),
      ...repeat("#f4d060", 40),
      ...repeat("#2d8f54", 38),
      ...repeat("#2f6fd6", 36),
      ...repeat("#7f4bb0", 32),
      ...repeat("#f8f2dc", 16),
      ...repeat("#08090c", 16),
    ]);

    const palette = createAutopaletteFromImageData(imageData);

    expectDistinctPalette(palette);
    expect(palette.some((color) => getAutopaletteColorDistance(color, "#c83a24") < 0.08)).toBe(true);
    expect(palette.some((color) => getAutopaletteColorDistance(color, "#2d8f54") < 0.08)).toBe(true);
    expect(palette.some((color) => getAutopaletteColorDistance(color, "#f8f2dc") < 0.08)).toBe(true);
    expect(palette.some((color) => getAutopaletteColorDistance(color, "#08090c") < 0.08)).toBe(true);
  });

  it("backfills missing colors with toybox colors least similar to the chosen image colors", () => {
    const imageData = makeImageData(repeat("#c83228", 96));

    const palette = createAutopaletteFromImageData(imageData);
    const toyboxColors: readonly string[] = PAINT_APP_PALETTES.toybox.colors;
    const imageColor = palette.find(
      (color) => !toyboxColors.includes(color),
    );
    const toyboxBackfill = palette.filter((color) =>
      toyboxColors.includes(color),
    );

    expectDistinctPalette(palette);
    expect(imageColor).toBeTruthy();
    expect(toyboxBackfill).toHaveLength(AUTOPALETTE_COLOR_COUNT - 1);

    const distances = toyboxBackfill.map((color) =>
      getAutopaletteColorDistance(color, imageColor ?? "#c83228"),
    );
    expect(distances).toEqual([...distances].sort((a, b) => b - a));
  });

  it("keeps dark and light image anchors for contrast when the image has them", () => {
    const imageData = makeImageData([
      ...repeat("#6d6a58", 80),
      ...repeat("#737058", 80),
      ...repeat("#05070a", 6),
      ...repeat("#fbf3d8", 6),
    ]);

    const palette = createAutopaletteFromImageData(imageData);

    expectDistinctPalette(palette);
    expect(palette.some((color) => getAutopaletteColorDistance(color, "#05070a") < 0.08)).toBe(true);
    expect(palette.some((color) => getAutopaletteColorDistance(color, "#fbf3d8") < 0.08)).toBe(true);
  });
});
