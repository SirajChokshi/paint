import {
  getClosestPaletteColor,
  rgbFromHex,
  type Palette,
} from "pixel-paint";

export const PAINT_APP_PALETTES = {
  toybox: {
    name: "Toybox",
    colors: [
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
    ],
  },
  watercolor: {
    name: "Watercolor",
    colors: [
      "#000000",
      "#41405c",
      "#8f9caf",
      "#ffffff",
      "#9c3f5f",
      "#f26f7f",
      "#f2a65e",
      "#ffe37a",
      "#3f8f68",
      "#7bdc91",
      "#299aa0",
      "#83e2e8",
      "#3f66a6",
      "#7fa2ff",
      "#a8754a",
      "#d982d9",
    ],
  },
  arcade: {
    name: "Arcade",
    colors: [
      "#000000",
      "#23234a",
      "#7e86a6",
      "#ffffff",
      "#8e1f3f",
      "#ff3f5f",
      "#ff8f2f",
      "#ffe14a",
      "#1f8f5a",
      "#39e86f",
      "#0f9fa8",
      "#35dfff",
      "#254eb8",
      "#4f79ff",
      "#9b5a2f",
      "#d94fff",
    ],
  },
  systemGarden: {
    name: "Garden",
    colors: [
      "#000000",
      "#353942",
      "#8b9088",
      "#ffffff",
      "#7f3342",
      "#c84f5f",
      "#c97848",
      "#d8b84f",
      "#3f7358",
      "#6fbf72",
      "#3f8380",
      "#75c8c8",
      "#3f5f91",
      "#6f8fd0",
      "#806044",
      "#b86fb8",
    ],
  },
} as const satisfies Record<string, { name: string; colors: Palette }>;

export type PaintPaletteId = keyof typeof PAINT_APP_PALETTES;

export const DEFAULT_PAINT_PALETTE_ID: PaintPaletteId = "toybox";
export const PAINT_APP_PALETTE_IDS = Object.keys(
  PAINT_APP_PALETTES,
) as PaintPaletteId[];
export const PAINT_APP_PALETTE = PAINT_APP_PALETTES[
  DEFAULT_PAINT_PALETTE_ID
].colors;

export function getPaintPalette(id: PaintPaletteId): Palette {
  return PAINT_APP_PALETTES[id]?.colors ?? PAINT_APP_PALETTE;
}

export function getPaintPaletteColor(
  id: PaintPaletteId,
  colorIndex: number,
): string {
  return getPaintPalette(id)[colorIndex] ?? getPaintPalette(id)[0] ?? "#000000";
}

export function getPaintPaletteColorIndex(
  color: string,
  palette: Palette = PAINT_APP_PALETTE,
): number {
  const quantized = quantizeToPaintPalette(color, palette);
  const index = palette.indexOf(quantized);
  return index === -1 ? 0 : index;
}

export function quantizeToPaintPalette(
  color: string,
  palette: Palette = PAINT_APP_PALETTE,
): string {
  try {
    return getClosestPaletteColor(rgbFromHex(color), palette);
  } catch {
    return palette[0] ?? "#000000";
  }
}
