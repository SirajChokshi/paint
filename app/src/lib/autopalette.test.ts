import { describe, expect, it } from "vitest";
import { PAINT_APP_PALETTES } from "./palette";
import {
  AUTOPALETTE_COLOR_COUNT,
  AUTOPALETTE_MIN_DISTANCE,
  analyzeAutopaletteImageData,
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

function makeGridImageData(
  width: number,
  height: number,
  getColor: (x: number, y: number) => string,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = getColor(x, y);
      const offset = (y * width + x) * 4;
      data[offset] = Number.parseInt(color.slice(1, 3), 16);
      data[offset + 1] = Number.parseInt(color.slice(3, 5), 16);
      data[offset + 2] = Number.parseInt(color.slice(5, 7), 16);
      data[offset + 3] = 255;
    }
  }

  return {
    data,
    width,
    height,
  } as ImageData;
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

function countNearPaletteColors(
  palette: readonly string[],
  colors: readonly string[],
  tolerance = 0.09,
): number {
  return palette.filter((paletteColor) =>
    colors.some(
      (color) => getAutopaletteColorDistance(paletteColor, color) < tolerance,
    ),
  ).length;
}

function countExactPaletteColors(
  palette: readonly string[],
  colors: readonly string[],
): number {
  return palette.filter((paletteColor) => colors.includes(paletteColor)).length;
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

  it("detects a centered subject and allocates more palette colors to it than the busy background", () => {
    const backgroundColors = [
      "#19324a",
      "#244c6a",
      "#2f5f78",
      "#3f6a58",
      "#536a3e",
      "#6a6642",
      "#76604a",
      "#4e524d",
      "#2d4336",
      "#394f6a",
      "#5f5038",
      "#475b38",
    ];
    const subjectColors = [
      "#17110f",
      "#3a2118",
      "#6f3f2d",
      "#9d6244",
      "#c38662",
      "#e0ad87",
      "#f3d2aa",
      "#f8efe0",
    ];
    const imageData = makeGridImageData(72, 72, (x, y) => {
      const inSubject = x >= 24 && x < 48 && y >= 16 && y < 56;
      if (!inSubject) {
        return backgroundColors[(x + y * 3) % backgroundColors.length];
      }

      const eyeOrMouth =
        (y >= 28 && y <= 30 && (x >= 30 && x <= 34 || x >= 38 && x <= 42)) ||
        (y >= 42 && y <= 44 && x >= 32 && x <= 40);
      if (eyeOrMouth) {
        return x % 2 === 0 ? "#17110f" : "#f8efe0";
      }

      return subjectColors[Math.floor((x - 24) / 3) % subjectColors.length];
    });

    const analysis = analyzeAutopaletteImageData(imageData);
    const subjectMatches = countNearPaletteColors(analysis.palette, subjectColors);
    const backgroundMatches = countExactPaletteColors(analysis.palette, backgroundColors);

    expectDistinctPalette(analysis.palette);
    expect(analysis.focalPoint.x).toBeGreaterThan(0.38);
    expect(analysis.focalPoint.x).toBeLessThan(0.62);
    expect(analysis.focalPoint.y).toBeGreaterThan(0.32);
    expect(analysis.focalPoint.y).toBeLessThan(0.72);
    expect(subjectMatches).toBeGreaterThanOrEqual(8);
    expect(backgroundMatches).toBeLessThanOrEqual(5);
  });

  it("keeps a muted face-like subject ahead of a saturated busy background", () => {
    const backgroundColors = [
      "#103f9f",
      "#0f6ccf",
      "#108f7a",
      "#65a812",
      "#b58d0f",
      "#b55212",
      "#8b1d7a",
      "#3a188c",
    ];
    const subjectColors = [
      "#2b211d",
      "#4a3128",
      "#765245",
      "#987060",
      "#b58a78",
      "#d0a992",
      "#e3c2aa",
      "#f1dfcf",
    ];
    const imageData = makeGridImageData(80, 64, (x, y) => {
      const inSubject = x >= 30 && x < 50 && y >= 14 && y < 52;
      if (!inSubject) {
        return backgroundColors[(x * 5 + y * 7) % backgroundColors.length];
      }

      const feature =
        (y >= 29 && y <= 31 && (x >= 35 && x <= 38 || x >= 43 && x <= 46)) ||
        (y >= 42 && y <= 44 && x >= 37 && x <= 44);
      if (feature) {
        return x % 2 === 0 ? "#2b211d" : "#f1dfcf";
      }

      return subjectColors[Math.floor((y - 14) / 5) % subjectColors.length];
    });

    const analysis = analyzeAutopaletteImageData(imageData);
    const subjectMatches = countNearPaletteColors(analysis.palette, subjectColors);
    const backgroundMatches = countExactPaletteColors(analysis.palette, backgroundColors);

    expectDistinctPalette(analysis.palette);
    expect(analysis.focalPoint.x).toBeGreaterThan(0.32);
    expect(analysis.focalPoint.x).toBeLessThan(0.68);
    expect(subjectMatches).toBeGreaterThan(backgroundMatches);
  });
});
