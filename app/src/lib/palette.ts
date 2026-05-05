import {
  getClosestPaletteColor,
  rgbFromHex,
  type Palette,
} from "pixel-paint";

export const PAINT_APP_PALETTE = [
  "#000000",
  "#3b3b58",
  "#8f96a8",
  "#ffffff",
  "#9e2f3f",
  "#e84646",
  "#f28c3c",
  "#ffd84a",
  "#2f8f5f",
  "#5fd36f",
  "#219aa0",
  "#5ed7e8",
  "#3456a4",
  "#5f8cff",
  "#9a6a3a",
  "#d65ad1",
] as const satisfies Palette;

export function quantizeToPaintPalette(color: string): string {
  try {
    return getClosestPaletteColor(rgbFromHex(color), PAINT_APP_PALETTE);
  } catch {
    return PAINT_APP_PALETTE[0];
  }
}
